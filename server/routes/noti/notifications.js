const express = require('express');
const cron = require('node-cron');
const cors = require('cors');
const { Server } = require('ws');
const db = require('../../db');

const router = express.Router();

// CORS configuration for the router
router.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // อนุญาต request ที่ไม่มี origin (เช่น WebSocket)
        try {
            const url = new URL(origin);
            if (['3000', '3001'].includes(url.port)) { // อนุญาตทั้ง 3000 (frontend) และ 3001 (backend/test)
                callback(null, true);
            } else {
                callback(null, false); // เปลี่ยนเป็น 403 แทน 500
            }
        } catch (e) {
            callback(null, false); // ป้องกัน error 500
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
router.use(express.json());

// =========================================================
// WebSocket Logic
// =========================================================

const clients = new Map();

const setupWebSocket = (server) => {
    const wss = new Server({ server, path: '/ws' });
    wss.on('connection', (ws, req) => {
        console.log(`🔗 WebSocket client connected from ${req.headers.origin || 'unknown'} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })} with headers:`, req.headers);

        const url = new URL(req.url, `http://${req.headers.host}`);
        const userIdParam = url.searchParams.get('userId');
        const userId = parseInt(userIdParam);

        console.log(`📋 Received userId parameter: '${userIdParam}', parsed as: ${userId}`);

        if (!userIdParam || isNaN(userId)) {
            console.error(`❌ Invalid or missing userId in WebSocket connection: '${userIdParam}' from ${req.headers.origin || 'unknown'}`);
            ws.close(1008, 'Invalid userId');
            return;
        }

        clients.set(userId, ws);
        console.log(`✅ WebSocket connection established for userId: ${userId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

        // ส่งข้อมูลเริ่มต้นเมื่อเชื่อมต่อ
        (async () => {
            try {
                const countResult = await db.query(
                    `SELECT COUNT(*) as total FROM notifications WHERE user_id = $1 AND is_read = false;`,
                    [userId]
                );
                const total = parseInt(countResult.rows[0].total);
                const result = await db.query(
                    `SELECT * FROM notifications WHERE user_id = $1 AND is_read = false ORDER BY created_at DESC LIMIT 5;`,
                    [userId]
                );
                const initialNotifications = result.rows;
                if (initialNotifications.length > 0 || total > 0) {
                    ws.send(JSON.stringify({
                        type: 'initial_notifications',
                        data: initialNotifications,
                        total: total,
                    }));
                    console.log(`📨 Sent initial notifications to userId: ${userId} with total ${total} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
                }
            } catch (error) {
                console.error(`❌ Error fetching initial notifications for userId: ${userId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
            }
        })();

        ws.on('message', (message) => {
            console.log(`📩 Received message from userId ${userId}:`, message);
        });

        ws.on('close', (event) => {
            console.log(`🔌 WebSocket client disconnected for userId: ${userId}, code: ${event.code}, reason: ${event.reason} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
            clients.delete(userId);
        });

        ws.on('error', (error) => {
            console.error(`❌ WebSocket error for userId: ${userId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`, error);
            clients.delete(userId);
        });
    });

    wss.on('error', (error) => {
        console.error(`❌ WebSocket server error at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
    });

    console.log(`🚀 WebSocket server initialized on path /ws at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
};

const sendNotificationToUser = (userId, notification) => {
    const ws = clients.get(userId);
    if (ws && ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
            type: 'notification',
            data: notification,
        }));
        console.log(`📨 Sent WebSocket notification to userId: ${userId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
    } else {
        console.log(`⚠️ No active WebSocket connection for userId: ${userId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
    }
};

// =========================================================
// Notification Worker Logic
// =========================================================

const createNotification = async (userId, title, message, relatedTable, relatedId) => {
    try {
        const query = `
            INSERT INTO notifications (user_id, title, message, related_table, related_id, created_at, is_read)
            VALUES ($1, $2, $3, $4, $5, NOW(), false)
            RETURNING *;
        `;
        const values = [userId, title, message, relatedTable, relatedId];
        const result = await db.query(query, values);
        const notification = result.rows[0];
        console.log(`✅ Created notification for user ID: ${userId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
        console.log(`   -> Added new notification for table '${relatedTable}' with ID '${relatedId}'`);

        sendNotificationToUser(userId, notification);
        return notification;
    } catch (error) {
        console.error(`❌ Error creating notification for userId: ${userId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
        throw error;
    }
};

const checkNotificationRules = async () => {
    console.log(`⏰ Checking active notification rules at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

    const idColumnMap = {
        'med_subwarehouse': 'med_sid',
        'med_table': 'med_id',
        'med_requests': 'request_id',
        'overdue_med': 'overdue_id',
        'med_cut_off_period': 'med_period_id',
        'adr_registry': 'adr_id',
        'error_medication': 'err_med_id',
    };

    const columnAliasMap = {
        'adr_registry': { 'created_at': 'time' },
        'error_medication': { 'created_at': 'time' }
    };

    try {
        const rulesResult = await db.query('SELECT * FROM noti_rules WHERE is_active = true;');
        const rules = rulesResult.rows;

        for (const rule of rules) {
            const { rule_id, rule_name, related_table, trigger_condition, template_title, template_message, recipient_role_id } = rule;

            let tableInfo = related_table;
            if (typeof related_table === 'string') {
                try {
                    tableInfo = JSON.parse(related_table);
                } catch (e) {
                    console.error(`   -> Error parsing JSON from related_table for rule '${rule_name}' at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, e);
                    continue;
                }
            }

            if (!tableInfo || !tableInfo.main_table) {
                console.error(`   -> Invalid related_table structure for rule: ${rule_name} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
                continue;
            }

            const mainTable = tableInfo.main_table;
            const idColumnName = idColumnMap[mainTable] || 'id';
            let fromClause = `"${mainTable}"`;
            let joinClause = '';

            if (tableInfo.join_tables) {
                for (const joinKey in tableInfo.join_tables) {
                    const joinTable = tableInfo.join_tables[joinKey];
                    const joinTableName = joinTable.table;
                    const mainColumn = joinTable.on.main_table_column;
                    const joinColumn = joinTable.on.join_table_column;
                    joinClause += ` JOIN "${joinTableName}" ON "${mainTable}"."${mainColumn}" = "${joinTableName}"."${joinColumn}"`;
                }
                fromClause += joinClause;
            }

            console.log(`- Evaluating rule: ${rule_name} for table: ${mainTable} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

            const escapeLiteral = (value) => {
                if (value === null || value === undefined) return 'NULL';
                if (typeof value === 'string') return `'${String(value).replace(/'/g, "''")}'`;
                if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
                return String(value); // สำหรับประเภทอื่นๆ เช่น number
            };

            let columnName = trigger_condition?.field;

            const operator = trigger_condition?.operator;
            const value = trigger_condition?.value;

            if (!columnName || !operator || value === undefined) {
                console.error(`   -> Invalid trigger_condition structure for rule: ${rule_name} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
                continue;
            }

            let whereClause;
            let fieldToUse;

            // ตรวจสอบว่า field เป็นคำสั่ง SQL ที่ต้องประมวลผลโดยตรง
            if (columnName.includes('(') || columnName.includes('::')) {
                fieldToUse = columnName; // ใช้คำสั่ง SQL โดยตรง ไม่ต้องครอบด้วย quotes
            } else {
                fieldToUse = `"${mainTable}"."${columnName}"`; // ใช้ชื่อคอลัมน์ปกติ
            }

            if (typeof value === 'boolean') {
                whereClause = `${fieldToUse} ${operator} ${value ? 'TRUE' : 'FALSE'}`;
            } else if (typeof value === 'string' && (value.toLowerCase().includes('now(') || value.toLowerCase().includes('interval'))) {
                // ใช้ค่า value ที่เป็นคำสั่ง SQL โดยตรง
                whereClause = `${fieldToUse} ${operator} ${value}`;
            } else {
                whereClause = `${fieldToUse} ${operator} ${escapeLiteral(value)}`;
            }

            const dynamicQuery = `SELECT * FROM ${fromClause} WHERE ${whereClause};`;

            console.log(`   -> Dynamic Query: ${dynamicQuery}`);

            try {
                const dataResult = await db.query(dynamicQuery);
                const dataRows = dataResult.rows;

                if (dataRows.length > 0) {
                    console.log(`   -> Condition matched! Found ${dataRows.length} rows at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

                    const usersResult = await db.query('SELECT uid FROM users WHERE "role_id" = $1;', [recipient_role_id]);
                    const users = usersResult.rows;

                    for (const user of users) {
                        for (const row of dataRows) {
                            const relatedId = row[idColumnName];
                            if (!relatedId) {
                                console.error(`   -> No relatedId in column '${idColumnName}' for row:`, row);
                                continue;
                            }

                            const logCheckQuery = `
                                SELECT * FROM notification_log
                                WHERE rule_id = $1 AND related_id = $2 AND related_table = $3
                                AND sent_at > NOW() - INTERVAL '24 hours';
                            `;
                            const logCheckResult = await db.query(logCheckQuery, [rule_id, relatedId, mainTable]);

                            if (logCheckResult.rows.length === 0) {
                                let renderedMessage = template_message.replace(/\[([^\[\]]+)]/g, (match, key) => {
                                    const value = row[key.trim()];
                                    console.log(`   -> Replacing key '${key.trim()}' with value '${value}' in message at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
                                    if (value instanceof Date) return value.toLocaleDateString('th-TH');
                                    return value || match;
                                });

                                let renderedTitle = template_title.replace(/\[([^\[\]]+)]/g, (match, key) => {
                                    const value = row[key.trim()];
                                    if (value instanceof Date) return value.toLocaleDateString('th-TH');
                                    return value || match;
                                });

                                console.log(`   -> Creating notification for item ID '${relatedId}' in table '${mainTable}' at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
                                console.log(`   -> Message: "${renderedMessage}"`);
                                console.log(`   -> Title: "${renderedTitle}"`);

                                await createNotification(user.uid, renderedTitle, renderedMessage, mainTable, relatedId);
                                await db.query(`
                                    INSERT INTO notification_log (rule_id, related_table, related_id, sent_at)
                                    VALUES ($1, $2, $3, NOW());
                                `, [rule_id, mainTable, relatedId]);
                            } else {
                                console.log(`   -> Notification for rule ${rule_id} and related ID ${relatedId} sent recently. Skipping at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
                            }
                        }
                    }
                }
                await db.query('UPDATE noti_rules SET last_checked_at = NOW() WHERE rule_id = $1;', [rule.rule_id]);
            } catch (queryError) {
                console.error(`❌ Error running dynamic query for rule '${rule_name}' at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, queryError);
                continue;
            }
        }
    } catch (error) {
        console.error(`❌ Error in checkNotificationRules at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
    }
};
// ===== Config: ความถี่การทำงาน (วินาที) =====
const CRON_SECONDS = Number(process.env.NOTI_CRON_SECONDS || 10); // ปรับเป็น 10/20 ได้
const CRON_EXPR = `*/${CRON_SECONDS} * * * * *`; // มีวินาที

let isRunning = false;
async function runCheckSafely() {
    if (isRunning) {
        console.log(`⏳ Skip: previous check still running at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
        return;
    }
    isRunning = true;
    try {
        await checkNotificationRules();
    } catch (error) {
        console.error(`❌ Cron job error at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
    } finally {
        isRunning = false;
    }
}

// Run once on startup
runCheckSafely();

// Schedule with seconds precision
cron.schedule(CRON_EXPR, runCheckSafely);

console.log(`🕒 Notification worker scheduled with "${CRON_EXPR}" (every ${CRON_SECONDS}s)`);

// =========================================================
// API Endpoints
// =========================================================

router.get('/notifications/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid User ID' });
        }

        const result = await db.query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC ;`,
            [userId]
        );
        res.status(200).json(result.rows || []);
    } catch (error) {
        console.error(`❌ Error fetching notifications for userId ${userId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/notifications-total/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid User ID' });
        }

        const result = await db.query(
            `SELECT COUNT(*) as total FROM notifications WHERE user_id = $1 AND is_read = false`,
            [userId]
        );
        const total = parseInt(result.rows[0].total) || 0;
        res.status(200).json({ total });
    } catch (error) {
        console.error(`❌ Error fetching notifications for userId ${userId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/notifications', async (req, res) => {
    try {
        const { userId, title, message, related_table, related_id } = req.body;

        if (!userId || typeof userId !== 'number' || !title || typeof title !== 'string' || !message || typeof message !== 'string') {
            return res.status(400).json({ message: 'Missing or invalid required fields: userId (number), title (string), and message (string).' });
        }

        const notification = await createNotification(userId, title, message, related_table || null, related_id || null);
        res.status(201).json({ message: 'Notification created successfully.', data: notification });
    } catch (error) {
        console.error(`❌ Error creating notification for userId ${userId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.patch('/notifications/:notificationId', async (req, res) => {
    const notificationId = parseInt(req.params.notificationId); // กำหนดนอก try-catch
    console.log(`Received PATCH request to update notification status for ID ${notificationId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
    console.log("Request body:", req.body);
    try {
        const { isRead } = req.body;

        if (isNaN(notificationId)) {
            return res.status(400).json({ message: 'Invalid Notification ID.' });
        }

        if (typeof isRead !== 'boolean') {
            return res.status(400).json({ message: 'Invalid or missing "isRead" field. It must be a boolean.' });
        }

        const values = [isRead, notificationId];
        const query = `UPDATE notifications SET is_read = $1 WHERE notification_id = $2 RETURNING *;`;

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Notification not found.' });
        }

        res.status(200).json({ message: 'Notification updated successfully.', data: result.rows[0] });
    } catch (error) {
        console.error(`❌ Error updating notification ID ${notificationId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.patch('/notifications/user/:userId/read-all', async (req, res) => {
    console.log(`Received PATCH request to mark all notifications as read for user ${req.params.userId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid User ID.' });
        }

        const query = `
            UPDATE notifications
            SET is_read = true
            WHERE user_id = $1 AND is_read = false
            RETURNING *;
        `;
        const result = await db.query(query, [userId]);

        res.status(200).json({
            message: `Successfully marked ${result.rowCount} notifications as read for user ${userId}.`,
            data: result.rows
        });
    } catch (error) {
        console.error(`❌ Error updating all notifications as read for userId ${userId} at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = {
    setupWebSocket,
    router,
};