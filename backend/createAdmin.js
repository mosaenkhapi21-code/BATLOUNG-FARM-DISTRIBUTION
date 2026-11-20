const bcrypt = require('bcryptjs');
const { db } = require('./config/db');

async function createAdmin() {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO admins (username, password)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE password = VALUES(password)`,
            [username, hashedPassword]
        );

        console.log(`Administrator "${username}" is ready.`);
    } catch (error) {
        console.error('Error creating administrator:', error.message);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
}

createAdmin();
