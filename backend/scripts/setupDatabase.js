const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'batloung_farm';

if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
    throw new Error('DB_NAME may only contain letters, numbers and underscores');
}

function loadSql(fileName) {
    const filePath = path.join(__dirname, '..', 'database', fileName);

    return fs
        .readFileSync(filePath, 'utf8')
        .replaceAll('`batloung_farm`', `\`${dbName}\``);
}

async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    try {
        await connection.query(loadSql('schema.sql'));
        await connection.query(loadSql('seed.sql'));
        console.log(`Database "${dbName}" is ready with sample data.`);
    } finally {
        await connection.end();
    }
}

setupDatabase().catch((error) => {
    console.error('Database setup failed:', error.message);
    process.exitCode = 1;
});
