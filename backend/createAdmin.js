
const bcrypt = require('bcryptjs');
const { db } = require('./config/db');

async function createAdmin() {
    try {
        const username = 'admin';
        const password = 'Admin@123';

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO admins (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        console.log('Administrator account created successfully!');
        console.log('Username: admin');
        console.log('Password: Admin@123');

    } catch (error) {
        console.error('Error creating administrator:', error.message);
    } finally {
        await db.end();
    }
}

createAdmin();
