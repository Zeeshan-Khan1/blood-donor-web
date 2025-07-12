const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MSSQL config
const config = {
    user: 'sa',
    password: '',
    server: '',
    port: 1433,
    database: 'BloodDonationDB',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

// Database connection pool
let pool;
async function connectToDatabase() {
    try {
        pool = await sql.connect(config);
        console.log('Connected to SQL Server');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}
connectToDatabase();

// Admin credentials (in production, use proper authentication with hashed passwords)
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "admin123" // Change this to a strong password in production
};

// Admin login endpoint
app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        res.status(200).json({ success: true, message: "Login successful" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Register Donor with duplicate check
app.post('/register-donor', async (req, res) => {
    const { name, bloodGroup, phone, province, city } = req.body;

    try {
        // Check if donor already exists by phone
        const existingDonor = await pool.request()
            .input('phone', sql.NVarChar, phone)
            .query('SELECT Name FROM Donors WHERE Phone = @phone');

        if (existingDonor.recordset.length > 0) {
            return res.status(400).json({ 
                message: `Dear ${existingDonor.recordset[0].Name}, you are already registered as a donor with this phone number!` 
            });
        }

        // Insert new donor
        await pool.request()
            .input('Name', sql.NVarChar, name)
            .input('BloodGroup', sql.NVarChar, bloodGroup)
            .input('Phone', sql.NVarChar, phone)
            .input('Province', sql.NVarChar, province)
            .input('City', sql.NVarChar, city)
            .query(`
                INSERT INTO Donors (Name, BloodGroup, Phone, Province, City)
                VALUES (@Name, @BloodGroup, @Phone, @Province, @City)
            `);

        res.status(200).json({ 
            message: `Thank you, ${name}! You are now registered as a blood donor.` 
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Error processing registration' });
    }
});

// Search Donors
app.post('/search-donors', async (req, res) => {
    const { bloodGroup, province, city } = req.body;

    try {
        let query = `
            SELECT * FROM Donors 
            WHERE BloodGroup = @bloodGroup
        `;

        const request = pool.request()
            .input('bloodGroup', sql.NVarChar, bloodGroup);

        if (province) {
            query += ` AND Province = @province`;
            request.input('province', sql.NVarChar, province);
        }

        if (city) {
            query += ` AND City LIKE @city`;
            request.input('city', sql.NVarChar, `%${city}%`);
        }

        query += ` ORDER BY City, Name`;

        const result = await request.query(query);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ message: 'Error searching donors' });
    }
});

// Get all donors (admin only)
app.get('/all-donors', async (req, res) => {
    try {
        const result = await pool.request()
            .query('SELECT * FROM Donors ORDER BY Province, City, BloodGroup');
        
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching donors:', error);
        res.status(500).json({ message: 'Error fetching donor data' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Handle shutdown
process.on('SIGINT', async () => {
    if (pool) {
        await pool.close();
        console.log('SQL Server connection closed');
    }
    process.exit();
});
