const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database directory if it doesn't exist
const dbPath = path.join(__dirname, 'database.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeTables();
    }
});

// Initialize database tables
function initializeTables() {
    db.serialize(() => {
        // Create employees table
        db.run(`CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            department TEXT NOT NULL,
            leaveBalance INTEGER DEFAULT 20
        )`);

        // Create leave_requests table
        db.run(`CREATE TABLE IF NOT EXISTS leave_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employeeId INTEGER NOT NULL,
            startDate TEXT NOT NULL,
            endDate TEXT NOT NULL,
            reason TEXT NOT NULL,
            type TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING',
            createdAt TEXT NOT NULL,
            FOREIGN KEY (employeeId) REFERENCES employees (id)
        )`);

    });
}

module.exports = db;