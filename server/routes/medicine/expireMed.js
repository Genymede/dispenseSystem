// const express = require('express');
// const db = require('../../db'); // Path to your database connection file

// const router = express.Router();

// router.use(express.json());

// // =========================================================
// // API Endpoints
// // =========================================================

// /**
//  * @route   GET /api/notifications/expired-medicines
//  * @desc    Get a list of all expired medicines with detailed information
//  * @access  Public
//  */
// router.get('/expired', async (req, res) => {
//     console.log(`Received GET request for expired medicines at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

//     try {
//         const query = `
//             SELECT
//                 em.expired_med_id,
//                 em.status,
//                 em.moved_at,
//                 ms.med_sid,
//                 ms.med_id,
//                 ms.exp_date,
//                 ms.mfg_date,
//                 ms.med_quantity,
//                 ms.packaging_type,
//                 ms.location,
//                 ms.is_expired,
//                 ms.med_showname,
//                 mt.med_name,
//                 mt.med_generic_name,
//                 mt.med_counting_unit,
//                 mt.med_marketing_name,
//                 mt.med_thai_name
//             FROM
//                 expired_medicines em
//             JOIN
//                 med_subwarehouse ms ON em.med_sid = ms.med_sid
//             JOIN
//                 med_table mt ON ms.med_id = mt.med_id
//             ORDER BY
//                 em.moved_at DESC;
//         `;

//         const result = await db.query(query);

//         if (result.rows.length === 0) {
//             console.log(`No expired medicines found at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
//             return res.status(200).json([]);
//         }

//         console.log(`Found ${result.rows.length} expired medicines at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
//         res.status(200).json(result.rows);
//     } catch (error) {
//         console.error(`❌ Error fetching expired medicines at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// // Example of exporting the router to be used in your main app.js or server.js file
// module.exports = router;

const express = require('express');
module.exports = (pool) => {
    const router = express.Router();

    router.use(express.json());

    /**
     * @route   GET /api/notifications/expired-medicines
     * @desc    Get a list of all expired medicines with detailed information
     * @access  Public
     */
    router.get('/expired', async (req, res) => {
        console.log(`Received GET request for expired medicines at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);

        try {
            const query = `
                SELECT
                    em.expired_med_id,
                    em.status,
                    em.moved_at,
                    ms.med_sid,
                    ms.med_id,
                    ms.exp_date,
                    ms.mfg_date,
                    ms.med_quantity,
                    ms.packaging_type,
                    ms.location,
                    ms.is_expired,
                    ms.med_showname,
                    mt.med_name,
                    mt.med_generic_name,
                    mt.med_counting_unit,
                    mt.med_marketing_name,
                    mt.med_thai_name
                FROM
                    med.expired_medicines em
                JOIN
                    med.med_subwarehouse ms ON em.med_sid = ms.med_sid
                JOIN
                    med.med_table mt ON ms.med_id = mt.med_id
                ORDER BY
                    em.moved_at DESC;
            `;

            const result = await pool.query(query);

            if (result.rows.length === 0) {
                console.log(`No expired medicines found at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
                return res.status(200).json([]);
            }

            console.log(`Found ${result.rows.length} expired medicines at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error(`❌ Error fetching expired medicines at ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}:`, error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });

    return router;
};