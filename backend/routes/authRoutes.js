const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post(
    '/login',
    asyncHandler(async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'Please enter username and password'
            });
        }

        const [admins] = await db.query(
            'SELECT * FROM admins WHERE username = ?',
            [username]
        );

        if (!admins.length) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const admin = admins[0];
        const validPassword = await bcrypt.compare(password, admin.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            return res.status(500).json({ message: 'JWT secret is not configured' });
        }

        const token = jwt.sign(
            { admin_id: admin.admin_id, username: admin.username },
            secret,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            username: admin.username
        });
    })
);

module.exports = router;
