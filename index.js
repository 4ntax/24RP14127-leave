const express = require('express');
const app = express();
const db = require('./db/config');

// Middleware for parsing JSON bodies
app.use(express.json());

// Employee routes
app.get('/api/employees', (req, res) => {
    db.all('SELECT * FROM employees', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/api/employees', (req, res) => {
    const { name, email, department } = req.body;
    if (!name || !email || !department) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    db.run('INSERT INTO employees (name, email, department, leaveBalance) VALUES (?, ?, ?, ?)',
        [name, email, department, 20],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: this.lastID,
                name,
                email,
                department,
                leaveBalance: 20
            });
        }
    );
});

// Leave request routes
app.get('/api/leaves', (req, res) => {
    db.all('SELECT * FROM leave_requests', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/api/leaves', (req, res) => {
    const { employeeId, startDate, endDate, reason, type } = req.body;
    if (!employeeId || !startDate || !endDate || !reason || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    db.get('SELECT * FROM employees WHERE id = ?', [employeeId], (err, employee) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        const createdAt = new Date().toISOString();
        db.run('INSERT INTO leave_requests (employeeId, startDate, endDate, reason, type, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [employeeId, startDate, endDate, reason, type, 'PENDING', createdAt],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({
                    id: this.lastID,
                    employeeId,
                    startDate,
                    endDate,
                    reason,
                    type,
                    status: 'PENDING',
                    createdAt
                });
            }
        );
    });
});

// Update leave request status
app.patch('/api/leaves/:id', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    db.run('UPDATE leave_requests SET status = ? WHERE id = ?',
        [status, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Leave request not found' });
            }
            db.get('SELECT * FROM leave_requests WHERE id = ?', [id], (err, leaveRequest) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json(leaveRequest);
            });
        }
    );
});

// Get employee's leave requests
app.get('/api/employees/:id/leaves', (req, res) => {
    const { id } = req.params;
    db.all('SELECT * FROM leave_requests WHERE employeeId = ?', [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Export app for testing
module.exports = app;

// Only start server if this file is run directly
if (require.main === module) {
    const startServer = (port) => {
        try {
            app.listen(port, () => {
                console.log(`Server is running on port ${port}`);
            }).on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`Port ${port} is busy, trying port ${port + 1}`);
                    startServer(port + 1);
                } else {
                    console.error('Server error:', err);
                }
            });
        } catch (err) {
            console.error('Failed to start server:', err);
        }
    };

    const PORT = process.env.PORT || 3000;
    startServer(PORT);
}