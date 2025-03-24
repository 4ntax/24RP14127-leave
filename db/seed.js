const db = require('./config');

// Sample employee data
const sampleEmployees = [
    ['John Doe', 'john@example.com', 'Engineering', 20],
    ['Jane Smith', 'jane@example.com', 'HR', 18],
    ['Mike Johnson', 'mike@example.com', 'Marketing', 15],
    ['Sarah Williams', 'sarah@example.com', 'Finance', 20],
    ['David Brown', 'david@example.com', 'Engineering', 17]
];

// Sample leave request data
const sampleLeaveRequests = [
    [1, '2024-01-15', '2024-01-20', 'Annual vacation', 'VACATION', 'APPROVED', '2024-01-01T10:00:00.000Z'],
    [2, '2024-02-01', '2024-02-02', 'Doctor appointment', 'SICK', 'APPROVED', '2024-01-15T09:30:00.000Z'],
    [3, '2024-03-10', '2024-03-15', 'Family event', 'PERSONAL', 'PENDING', '2024-02-20T14:20:00.000Z'],
    [4, '2024-04-05', '2024-04-07', 'Conference attendance', 'BUSINESS', 'APPROVED', '2024-03-01T11:45:00.000Z'],
    [5, '2024-05-20', '2024-05-21', 'Not feeling well', 'SICK', 'REJECTED', '2024-04-15T08:15:00.000Z']
];

// Function to seed employees table
async function seedEmployees() {
    console.log('Seeding employees table...');
    const insertEmployee = 'INSERT OR IGNORE INTO employees (name, email, department, leaveBalance) VALUES (?, ?, ?, ?)';
    
    for (const employee of sampleEmployees) {
        try {
            await new Promise((resolve, reject) => {
                db.run(insertEmployee, employee, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            console.error('Error inserting employee:', err);
        }
    }
    console.log('Employees seeding completed');
}

// Function to seed leave_requests table
async function seedLeaveRequests() {
    console.log('Seeding leave requests table...');
    const insertLeaveRequest = 'INSERT OR IGNORE INTO leave_requests (employeeId, startDate, endDate, reason, type, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    for (const request of sampleLeaveRequests) {
        try {
            await new Promise((resolve, reject) => {
                db.run(insertLeaveRequest, request, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            console.error('Error inserting leave request:', err);
        }
    }
    console.log('Leave requests seeding completed');
}

// Main seeding function
async function seedDatabase() {
    try {
        await seedEmployees();
        await seedLeaveRequests();
        console.log('Database seeding completed successfully');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing database connection:', err);
            } else {
                console.log('Database connection closed');
            }
        });
    }
}

// Execute seeding
seedDatabase();