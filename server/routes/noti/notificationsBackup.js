// // notifications.backend.js - โมดูล API สำหรับการจัดการการแจ้งเตือน

// const express = require('express');
// const cron = require('node-cron');
// const cors = require("cors");
// const db = require('../../db'); // โมดูลเชื่อมต่อฐานข้อมูลจริง

// const app = express();
// app.use(cors({
//     origin: (origin, callback) => {
//         // อนุญาตคำขอที่ไม่มี origin (เช่น คำขอจาก Postman)
//         if (!origin) return callback(null, true);

//         // ใช้ URL API เพื่อ parse origin และตรวจสอบพอร์ต
//         try {
//             const url = new URL(origin);
//             if (url.port === '3000') {
//                 callback(null, true); // อนุญาต
//             } else {
//                 callback(new Error('ไม่อนุญาตโดย CORS')); // ไม่อนุญาต
//             }
//         } catch (e) {
//             callback(new Error('ไม่อนุญาตโดย CORS')); // ไม่อนุญาตหาก URL ไม่ถูกต้อง
//         }
//     },
//     credentials: true,
//     // เพิ่มเมธอด PATCH ในรายการเมธอดที่อนุญาต
//     methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
//     // อนุญาต Content-Type ซึ่งจำเป็นสำหรับคำขอ POST และ PATCH
//     allowedHeaders: ['Content-Type'], 
// }));
// app.use(express.json());

// // =========================================================
// // Notification Worker Logic
// // =========================================================

// /**
//  * @description สร้างการแจ้งเตือนใหม่ในฐานข้อมูล
//  * @param {number} userId - ID ของผู้ใช้ที่จะได้รับการแจ้งเตือน
//  * @param {string} title - หัวข้อของการแจ้งเตือน
//  * @param {string} message - ข้อความของการแจ้งเตือน
//  * @param {string} relatedTable - ตารางที่เกี่ยวข้องกับการแจ้งเตือน
//  * @param {number} relatedId - ID ของรายการที่เกี่ยวข้อง
//  */
// const createNotification = async (userId, title, message, relatedTable, relatedId) => {
//     try {
//         const query = `
//             INSERT INTO notifications (user_id, title, message, related_table, related_id)
//             VALUES ($1, $2, $3, $4, $5);
//         `;
//         const values = [userId, title, message, relatedTable, relatedId];
//         await db.query(query, values);
//         console.log(`✅ สร้างการแจ้งเตือนสำหรับผู้ใช้ ID: ${userId}`);
//         // เพิ่ม console.log เพื่อตรวจสอบข้อมูลการแจ้งเตือนที่ถูกสร้าง
//         console.log(`   -> เพิ่มการแจ้งเตือนใหม่สำหรับตาราง '${relatedTable}' ด้วย ID '${relatedId}'`);
//     } catch (error) {
//         console.error('❌ ข้อผิดพลาดในการสร้างการแจ้งเตือน:', error);
//     }
// };

// /**
//  * @description ตรวจสอบกฎการแจ้งเตือนที่ใช้งานอยู่ทั้งหมดและเรียกใช้การแจ้งเตือนหากตรงตามเงื่อนไข
//  */
// const checkNotificationRules = async () => {
//     console.log('⏰ กำลังตรวจสอบกฎการแจ้งเตือนที่ใช้งานอยู่...');

//     // Mapping เพื่อเดาชื่อคอลัมน์ ID จากชื่อตารางหลัก
//     const idColumnMap = {
//         'med_table': 'med_id',
//         'med_requests': 'request_id',
//         'overdue_med': 'overdue_id',
//         'med_cut_off_period': 'med_period_id',
//         'adr_registry': 'adr_id',
//         'error_medication': 'err_med_id',
//     };

//     // Mapping สำหรับชื่อคอลัมน์ที่ไม่ตรงกันใน trigger_condition
//     const columnAliasMap = {
//         'adr_registry': { 'created_at': 'time' },
//         'error_medication': { 'created_at': 'time' }
//     };

//     try {
//         const rulesResult = await db.query('SELECT * FROM noti_rules WHERE is_active = true;');
//         const rules = rulesResult.rows;

//         for (const rule of rules) {
//             const { rule_id, rule_name, related_table, trigger_condition, template_title, template_message, recipient_role_id } = rule;

//             let tableInfo = related_table;
//             if (typeof related_table === 'string') {
//                 try {
//                     tableInfo = JSON.parse(related_table);
//                 } catch (e) {
//                     console.error(`   -> ข้อผิดพลาด: ไม่สามารถ parse JSON จาก related_table สำหรับกฎ '${rule_name}' ได้`, e);
//                     continue;
//                 }
//             }

//             if (!tableInfo || !tableInfo.main_table) {
//                 console.error(`   -> โครงสร้าง related_table ไม่ถูกต้องสำหรับกฎ: ${rule_name}`);
//                 continue;
//             }

//             const mainTable = tableInfo.main_table;
//             const idColumnName = idColumnMap[mainTable] || 'id';
//             let fromClause = `"${mainTable}"`;
//             let joinClause = '';

//             if (tableInfo.join_tables) {
//                 for (const joinKey in tableInfo.join_tables) {
//                     const joinTable = tableInfo.join_tables[joinKey];
//                     const joinTableName = joinTable.table;
//                     const mainColumn = joinTable.on.main_table_column;
//                     const joinColumn = joinTable.on.join_table_column;
//                     joinClause += ` JOIN "${joinTableName}" ON "${mainTable}"."${mainColumn}" = "${joinTableName}"."${joinColumn}"`;
//                 }
//                 fromClause += joinClause;
//             }

//             console.log(`- กำลังประเมินกฎ: ${rule_name} สำหรับตาราง: ${mainTable}`);

//             const escapeLiteral = (value) => {
//                 if (value === null || value === undefined) {
//                     return 'NULL';
//                 }
//                 return `'${String(value).replace(/'/g, "''")}'`;
//             };
            
//             // ใช้ชื่อคอลัมน์ที่ถูกแก้ไขหากมีใน mapping
//             let columnName = trigger_condition?.field;
//             if (columnAliasMap[mainTable] && columnAliasMap[mainTable][columnName]) {
//                 columnName = columnAliasMap[mainTable][columnName];
//             }
            
//             const operator = trigger_condition?.operator;
//             let value = trigger_condition?.value;

//             if (!columnName || !operator || value === undefined) {
//                 console.error(`   -> โครงสร้าง trigger_condition ไม่ถูกต้องสำหรับกฎ: ${rule_name}`);
//                 continue;
//             }

//             // =========================================================================================
//             // ส่วนที่แก้ไข: จัดการกับค่าใน WHERE clause อย่างเหมาะสม โดยเฉพาะฟังก์ชัน now()
//             // =========================================================================================
//             let whereClause;
//             let valueToUse = String(value);

//             // ตรวจสอบและแก้ไข 'now' ให้เป็น 'now()' หากพบ
//             if (valueToUse.toLowerCase().includes('now') && !valueToUse.toLowerCase().includes('now()')) {
//                 valueToUse = valueToUse.replace(/now/i, 'now()');
//             }

//             if (rule_name === 'Cut-off Period Approaching') {
//                 whereClause = `"${mainTable}"."${columnName}" = EXTRACT(DAY FROM NOW())`;
//             } else if (valueToUse.includes('now()') || valueToUse.includes('interval')) {
//                 // ถ้าค่าเป็น string ที่มีฟังก์ชัน SQL หรือ interval ให้ใช้ค่าดังกล่าวโดยไม่ต้องใส่ single quotes
//                 whereClause = `"${mainTable}"."${columnName}" ${operator} ${valueToUse}`;
//             } else {
//                 // สำหรับค่าอื่นๆ ให้ใส่ single quotes เพื่อป้องกัน SQL injection
//                 whereClause = `"${mainTable}"."${columnName}" ${operator} ${escapeLiteral(value)}`;
//             }
//             // =========================================================================================

//             const dynamicQuery = `SELECT * FROM ${fromClause} WHERE ${whereClause};`;

//             console.log(`   -> Dynamic Query: ${dynamicQuery}`);

//             try {
//                 const dataResult = await db.query(dynamicQuery);
//                 const dataRows = dataResult.rows;

//                 if (dataRows.length > 0) {
//                     console.log(`   -> ตรงตามเงื่อนไข! พบ ${dataRows.length} แถวที่ตรงกัน.`);

//                     const usersResult = await db.query('SELECT uid FROM users WHERE "roleID" = $1;', [recipient_role_id]);
//                     const users = usersResult.rows;

//                     for (const user of users) {
//                         for (const row of dataRows) {
//                             const relatedId = row[idColumnName];
//                             if (!relatedId) {
//                                 console.error(`   -> ไม่พบ relatedId ในคอลัมน์ '${idColumnName}' สำหรับแถว:`, row);
//                                 continue;
//                             }
                            
//                             const logCheckQuery = `
//                                 SELECT * FROM notification_log
//                                 WHERE rule_id = $1 AND related_id = $2 AND related_table = $3
//                                 AND sent_at > NOW() - interval '24 hours';
//                             `;
//                             const logCheckResult = await db.query(logCheckQuery, [rule_id, relatedId, mainTable]);

//                             if (logCheckResult.rows.length === 0) {
//                                 let renderedMessage = template_message.replace(/\[([^\[\]]+)]/g, (match, key) => {
//                                     const value = row[key.trim()];
//                                     if (value instanceof Date) {
//                                         return value.toLocaleDateString('th-TH');
//                                     }
//                                     return value || match;
//                                 });

//                                 let renderedTitle = template_title.replace(/\[([^\[\]]+)]/g, (match, key) => {
//                                     const value = row[key.trim()];
//                                     if (value instanceof Date) {
//                                         return value.toLocaleDateString('th-TH');
//                                     }
//                                     return value || match;
//                                 });
                                
//                                 console.log(`   -> กำลังสร้างการแจ้งเตือนสำหรับรายการ ID '${relatedId}' ในตาราง '${mainTable}'`);
//                                 console.log(`   -> ข้อความที่แสดง: "${renderedMessage}"`);
//                                 console.log(`   -> หัวข้อที่แสดง: "${renderedTitle}"`);

//                                 await createNotification(user.uid, renderedTitle, renderedMessage, mainTable, relatedId);
//                                 await db.query(`
//                                     INSERT INTO notification_log (rule_id, related_table, related_id)
//                                     VALUES ($1, $2, $3);
//                                 `, [rule_id, mainTable, relatedId]);
//                             } else {
//                                 console.log(`   -> การแจ้งเตือนสำหรับกฎ ${rule_id} และ ID ที่เกี่ยวข้อง ${relatedId} ถูกส่งไปแล้วเมื่อเร็วๆ นี้. ข้ามการดำเนินการ.`);
//                             }
//                         }
//                     }
//                 }
//                 await db.query('UPDATE noti_rules SET last_checked_at = NOW() WHERE rule_id = $1;', [rule.rule_id]);
//             } catch (queryError) {
//                 console.error(`❌ ข้อผิดพลาดในการรัน dynamic query สำหรับกฎ '${rule_name}':`, queryError);
//                 continue;
//             }
//         }
//     } catch (error) {
//         console.error('❌ ข้อผิดพลาดใน worker checkNotificationRules:', error);
//     }
// };

// // รันทุก 1 นาที
// cron.schedule('* * * * *', () => {
//     checkNotificationRules();
// });

// // รันครั้งแรกเมื่อเริ่มโปรแกรม
// checkNotificationRules();

// // =========================================================
// // API Endpoints
// // =========================================================

// app.get('/notifications/:userId', async (req, res) => {
//     try {
//         const userId = parseInt(req.params.userId);
//         if (isNaN(userId)) {
//             return res.status(400).json({ message: 'Invalid User ID' });
//         }

//         const result = await db.query(`SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC;`, [userId]);

//         res.status(200).json(result.rows || []);
//     } catch (error) {
//         console.error('Error fetching notifications:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// app.post('/notifications', async (req, res) => {
//     try {
//         const { userId, title, message, type, related_table, related_id } = req.body;

//         if (!userId || typeof userId !== 'number' || !title || typeof title !== 'string' || !message || typeof message !== 'string') {
//             return res.status(400).json({ message: 'Missing or invalid required fields: userId (number), title (string), and message (string).' });
//         }

//         const query = `
//             INSERT INTO notifications (user_id, title, message, type, related_table, related_id)
//             VALUES ($1, $2, $3, $4, $5, $6);
//         `;
//         const values = [userId, title, message, type || null, related_table || null, related_id || null];

//         await db.query(query, values);

//         res.status(201).json({ message: 'Notification created successfully.' });
//     } catch (error) {
//         console.error('Error creating notification:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// /**
//  * @description updates a notification (e.g., marks it as read).
//  * @param {number} notificationId - The ID of the notification to update.
//  * @param {boolean} isRead - The new read status.
//  */
// app.patch('/notifications/:notificationId', async (req, res) => {
//     console.log("Received PATCH request to update notification status");
//     console.log("Request body:", req.body);
//     try {
//         const notificationId = parseInt(req.params.notificationId);
//         const { isRead } = req.body;

//         if (isNaN(notificationId)) {
//             return res.status(400).json({ message: 'Invalid Notification ID.' });
//         }
        
//         if (typeof isRead !== 'boolean') {
//             return res.status(400).json({ message: 'Invalid or missing "isRead" field. It must be a boolean.' });
//         }
//         const values = [isRead, notificationId];
//         const query = `UPDATE notifications SET is_read = $1 WHERE notification_id = $2;`;
        
//         const result = await db.query(query, values);

//         if (result.rowCount === 0) {
//             return res.status(404).json({ message: 'Notification not found.' });
//         }

//         res.status(200).json({ message: 'Notification updated successfully.' });
//     } catch (error) {
//         console.error('Error updating notification:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// app.patch('/notifications/user/:userId/read-all', async (req, res) => {
//     console.log(`Received PATCH request to mark all notifications as read for user: ${req.params.userId}`);
    
//     try {
//         const userId = parseInt(req.params.userId);

//         if (isNaN(userId)) {
//             return res.status(400).json({ message: 'Invalid User ID.' });
//         }
        
//         // แก้ไข: อัปเดตเฉพาะการแจ้งเตือนที่มี `is_read = false` เท่านั้น
//         const query = `
//             UPDATE notifications
//             SET is_read = true
//             WHERE user_id = $1 AND is_read = false;
//         `;
//         const result = await db.query(query, [userId]);

//         // ส่ง response กลับโดยไม่ต้องสนใจว่ามีแถวถูกอัปเดตหรือไม่
//         res.status(200).json({ 
//             message: `Successfully marked ${result.rowCount} notifications as read for user ${userId}.` 
//         });

//     } catch (error) {
//         console.error('❌ Error updating all notifications as read:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// module.exports = app;


//v2.0
// notifications.backend.js - โมดูล API สำหรับการจัดการการแจ้งเตือน
const express = require('express');
const cron = require('node-cron');
const cors = require("cors");
const db = require('../../db'); // โมดูลเชื่อมต่อฐานข้อมูลจริง

const app = express();
app.use(cors({
    origin: (origin, callback) => {
        // อนุญาตคำขอที่ไม่มี origin (เช่น คำขอจาก Postman)
        if (!origin) return callback(null, true);

        // ใช้ URL API เพื่อ parse origin และตรวจสอบพอร์ต
        try {
            const url = new URL(origin);
            if (url.port === '3000') {
                callback(null, true); // อนุญาต
            } else {
                callback(new Error('ไม่อนุญาตโดย CORS')); // ไม่อนุญาต
            }
        } catch (e) {
            callback(new Error('ไม่อนุญาตโดย CORS')); // ไม่อนุญาตหาก URL ไม่ถูกต้อง
        }
    },
    credentials: true,
    // เพิ่มเมธอด PATCH ในรายการเมธอดที่อนุญาต
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    // อนุญาต Content-Type ซึ่งจำเป็นสำหรับคำขอ POST และ PATCH
    allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// =========================================================
// Notification Worker Logic
// =========================================================

/**
 * @description สร้างการแจ้งเตือนใหม่ในฐานข้อมูล
 * @param {number} userId - ID ของผู้ใช้ที่จะได้รับการแจ้งเตือน
 * @param {string} title - หัวข้อของการแจ้งเตือน
 * @param {string} message - ข้อความของการแจ้งเตือน
 * @param {string} relatedTable - ตารางที่เกี่ยวข้องกับการแจ้งเตือน
 * @param {number} relatedId - ID ของรายการที่เกี่ยวข้อง
 */
const createNotification = async (userId, title, message, relatedTable, relatedId) => {
    try {
        const query = `
            INSERT INTO notifications (user_id, title, message, related_table, related_id)
            VALUES ($1, $2, $3, $4, $5);
        `;
        const values = [userId, title, message, relatedTable, relatedId];
        await db.query(query, values);
        console.log(`✅ สร้างการแจ้งเตือนสำหรับผู้ใช้ ID: ${userId}`);
        // เพิ่ม console.log เพื่อตรวจสอบข้อมูลการแจ้งเตือนที่ถูกสร้าง
        console.log(`   -> เพิ่มการแจ้งเตือนใหม่สำหรับตาราง '${relatedTable}' ด้วย ID '${relatedId}'`);
    } catch (error) {
        console.error('❌ ข้อผิดพลาดในการสร้างการแจ้งเตือน:', error);
    }
};

/**
 * @description ตรวจสอบกฎการแจ้งเตือนที่ใช้งานอยู่ทั้งหมดและเรียกใช้การแจ้งเตือนหากตรงตามเงื่อนไข
 */
const checkNotificationRules = async () => {
    console.log('⏰ กำลังตรวจสอบกฎการแจ้งเตือนที่ใช้งานอยู่...');

    // Mapping เพื่อเดาชื่อคอลัมน์ ID จากชื่อตารางหลัก
    const idColumnMap = {
        'med_table': 'med_id',
        'med_requests': 'request_id',
        'overdue_med': 'overdue_id',
        'med_cut_off_period': 'med_period_id',
        'adr_registry': 'adr_id',
        'error_medication': 'err_med_id',
    };

    // Mapping สำหรับชื่อคอลัมน์ที่ไม่ตรงกันใน trigger_condition
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
                    console.error(`   -> ข้อผิดพลาด: ไม่สามารถ parse JSON จาก related_table สำหรับกฎ '${rule_name}' ได้`, e);
                    continue;
                }
            }

            if (!tableInfo || !tableInfo.main_table) {
                console.error(`   -> โครงสร้าง related_table ไม่ถูกต้องสำหรับกฎ: ${rule_name}`);
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

            console.log(`- กำลังประเมินกฎ: ${rule_name} สำหรับตาราง: ${mainTable}`);

            const escapeLiteral = (value) => {
                if (value === null || value === undefined) {
                    return 'NULL';
                }
                return `'${String(value).replace(/'/g, "''")}'`;
            };

            // ใช้ชื่อคอลัมน์ที่ถูกแก้ไขหากมีใน mapping
            let columnName = trigger_condition?.field;
            if (columnAliasMap[mainTable] && columnAliasMap[mainTable][columnName]) {
                columnName = columnAliasMap[mainTable][columnName];
            }

            const operator = trigger_condition?.operator;
            let value = trigger_condition?.value;

            if (!columnName || !operator || value === undefined) {
                console.error(`   -> โครงสร้าง trigger_condition ไม่ถูกต้องสำหรับกฎ: ${rule_name}`);
                continue;
            }

            // =========================================================================================
            // ส่วนที่แก้ไข: จัดการกับค่าใน WHERE clause อย่างเหมาะสม โดยเฉพาะฟังก์ชัน now()
            // =========================================================================================
            let whereClause;
            let valueToUse = String(value);

            // ส่วนนี้ไม่จำเป็นแล้ว เพราะใน JSONB มี now() อยู่แล้ว
            // if (valueToUse.toLowerCase().includes('now') && !valueToUse.toLowerCase().includes('now()')) {
            //     valueToUse = valueToUse.replace(/now/i, 'now()');
            // }

            // นี่คือ logic ที่ถูกต้องและครอบคลุม:
            // 1. ตรวจสอบว่า valueToUse เป็น string ที่มีคำว่า 'now' หรือ 'interval'
            if (typeof valueToUse === 'string' && (valueToUse.toLowerCase().includes('now(') || valueToUse.toLowerCase().includes('interval'))) {
                // ถ้าใช่ ให้ใช้ค่าดังกล่าวโดยไม่ต้องใส่ single quotes
                whereClause = `"${mainTable}"."${columnName}" ${operator} ${valueToUse}`;
            } else {
                // สำหรับค่าอื่นๆ ให้ใส่ single quotes เพื่อป้องกัน SQL injection
                whereClause = `"${mainTable}"."${columnName}" ${operator} ${escapeLiteral(value)}`;
            }
            // =========================================================================================

            const dynamicQuery = `SELECT * FROM ${fromClause} WHERE ${whereClause};`;

            console.log(`   -> Dynamic Query: ${dynamicQuery}`);

            try {
                const dataResult = await db.query(dynamicQuery);
                const dataRows = dataResult.rows;

                if (dataRows.length > 0) {
                    console.log(`   -> ตรงตามเงื่อนไข! พบ ${dataRows.length} แถวที่ตรงกัน.`);

                    const usersResult = await db.query('SELECT uid FROM users WHERE "role_id" = $1;', [recipient_role_id]);
                    const users = usersResult.rows;

                    for (const user of users) {
                        for (const row of dataRows) {
                            const relatedId = row[idColumnName];
                            if (!relatedId) {
                                console.error(`   -> ไม่พบ relatedId ในคอลัมน์ '${idColumnName}' สำหรับแถว:`, row);
                                continue;
                            }

                            const logCheckQuery = `
                                SELECT * FROM notification_log
                                WHERE rule_id = $1 AND related_id = $2 AND related_table = $3
                                AND sent_at > NOW() - interval '24 hours';
                            `;
                            const logCheckResult = await db.query(logCheckQuery, [rule_id, relatedId, mainTable]);

                            if (logCheckResult.rows.length === 0) {
                                let renderedMessage = template_message.replace(/\[([^\[\]]+)]/g, (match, key) => {
                                    const value = row[key.trim()];
                                    console.log(`   -> 0000000000000กำลังแทนที่คีย์ '${key.trim()}' ด้วยค่า '${value}' ในข้อความ`);
                                    if (value instanceof Date) {
                                        return value.toLocaleDateString('th-TH');
                                    }
                                    return value || match;
                                });

                                let renderedTitle = template_title.replace(/\[([^\[\]]+)]/g, (match, key) => {
                                    const value = row[key.trim()];
                                    if (value instanceof Date) {
                                        return value.toLocaleDateString('th-TH');
                                    }
                                    return value || match;
                                });

                                console.log(`   -> กำลังสร้างการแจ้งเตือนสำหรับรายการ ID '${relatedId}' ในตาราง '${mainTable}'`);
                                console.log(`   -> ข้อความที่แสดง: "${renderedMessage}"`);
                                console.log(`   -> หัวข้อที่แสดง: "${renderedTitle}"`);

                                await createNotification(user.uid, renderedTitle, renderedMessage, mainTable, relatedId);
                                await db.query(`
                                    INSERT INTO notification_log (rule_id, related_table, related_id)
                                    VALUES ($1, $2, $3);
                                `, [rule_id, mainTable, relatedId]);
                            } else {
                                console.log(`   -> การแจ้งเตือนสำหรับกฎ ${rule_id} และ ID ที่เกี่ยวข้อง ${relatedId} ถูกส่งไปแล้วเมื่อเร็วๆ นี้. ข้ามการดำเนินการ.`);
                            }
                        }
                    }
                }
                await db.query('UPDATE noti_rules SET last_checked_at = NOW() WHERE rule_id = $1;', [rule.rule_id]);
            } catch (queryError) {
                console.error(`❌ ข้อผิดพลาดในการรัน dynamic query สำหรับกฎ '${rule_name}':`, queryError);
                continue;
            }
        }
    } catch (error) {
        console.error('❌ ข้อผิดพลาดใน worker checkNotificationRules:', error);
    }
};

// รันทุก 1 นาที
cron.schedule('* * * * *', () => {
    checkNotificationRules();
});

// รันครั้งแรกเมื่อเริ่มโปรแกรม
checkNotificationRules();

// =========================================================
// API Endpoints
// =========================================================

app.get('/notifications/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid User ID' });
        }

        const result = await db.query(`SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC;`, [userId]);

        res.status(200).json(result.rows || []);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/notifications', async (req, res) => {
    try {
        const { userId, title, message, type, related_table, related_id } = req.body;

        if (!userId || typeof userId !== 'number' || !title || typeof title !== 'string' || !message || typeof message !== 'string') {
            return res.status(400).json({ message: 'Missing or invalid required fields: userId (number), title (string), and message (string).' });
        }

        const query = `
            INSERT INTO notifications (user_id, title, message, type, related_table, related_id)
            VALUES ($1, $2, $3, $4, $5, $6);
        `;
        const values = [userId, title, message, type || null, related_table || null, related_id || null];

        await db.query(query, values);

        res.status(201).json({ message: 'Notification created successfully.' });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @description updates a notification (e.g., marks it as read).
 * @param {number} notificationId - The ID of the notification to update.
 * @param {boolean} isRead - The new read status.
 */
app.patch('/notifications/:notificationId', async (req, res) => {
    console.log("Received PATCH request to update notification status");
    console.log("Request body:", req.body);
    try {
        const notificationId = parseInt(req.params.notificationId);
        const { isRead } = req.body;

        if (isNaN(notificationId)) {
            return res.status(400).json({ message: 'Invalid Notification ID.' });
        }

        if (typeof isRead !== 'boolean') {
            return res.status(400).json({ message: 'Invalid or missing "isRead" field. It must be a boolean.' });
        }
        const values = [isRead, notificationId];
        const query = `UPDATE notifications SET is_read = $1 WHERE notification_id = $2;`;

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Notification not found.' });
        }

        res.status(200).json({ message: 'Notification updated successfully.' });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.patch('/notifications/user/:userId/read-all', async (req, res) => {
    console.log(`Received PATCH request to mark all notifications as read for user: ${req.params.userId}`);

    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid User ID.' });
        }

        // แก้ไข: อัปเดตเฉพาะการแจ้งเตือนที่มี `is_read = false` เท่านั้น
        const query = `
            UPDATE notifications
            SET is_read = true
            WHERE user_id = $1 AND is_read = false;
        `;
        const result = await db.query(query, [userId]);

        // ส่ง response กลับโดยไม่ต้องสนใจว่ามีแถวถูกอัปเดตหรือไม่
        res.status(200).json({
            message: `Successfully marked ${result.rowCount} notifications as read for user ${userId}.`
        });

    } catch (error) {
        console.error('❌ Error updating all notifications as read:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = app;