const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'Namal8323@',
    server: 'localhost',
    port: 1433,
    database: 'BloodDonationDB',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function testConnection() {
    try {
        await sql.connect(config);
        console.log("✅ Connected to SQL Server!");

        const result = await sql.query`SELECT GETDATE() AS currentTime`;
        console.log("📅 Current Time from DB:", result.recordset[0].currentTime);

        await sql.close();
    } catch (err) {
        console.error("❌ Connection failed:", err);
        await sql.close();
    }
}

testConnection();
