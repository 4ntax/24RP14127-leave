const request = require('supertest');
const express = require('express');
const app = require('../index');
const db = require('../db/config');

describe('Employee API Endpoints', () => {
    let server;

    beforeAll(async () => {
        server = app.listen(0);        // Initialize tables
        await new Promise((resolve) => {
            db.serialize(() => {
                db.run(`CREATE TABLE IF NOT EXISTS employees (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    department TEXT NOT NULL,
                    leaveBalance INTEGER DEFAULT 20
                )`);
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
                )`, [], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
        });
        // Clear test database
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM employees', [], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    });

    afterAll(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
        // Close database connection
        await new Promise((resolve) => db.close(() => resolve()));
    });

    test('GET /api/employees should return empty array initially', async () => {
        const response = await request(app).get('/api/employees');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });

    test('POST /api/employees should create new employee', async () => {
        const newEmployee = {
            name: 'John Doe',
            email: 'john@example.com',
            department: 'IT'
        };

        const response = await request(app)
            .post('/api/employees')
            .send(newEmployee);

        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
            name: newEmployee.name,
            email: newEmployee.email,
            department: newEmployee.department,
            leaveBalance: 20
        });
    });
});

describe('Leave Request API Endpoints', () => {
    let employeeId;
    let server;

    beforeAll(async () => {
        server = app.listen(0);
        // Initialize tables
        await new Promise((resolve) => {
            db.serialize(() => {
                db.run(`DROP TABLE IF EXISTS leave_requests`);
                db.run(`DROP TABLE IF EXISTS employees`);
                db.run(`CREATE TABLE IF NOT EXISTS employees (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    department TEXT NOT NULL,
                    leaveBalance INTEGER DEFAULT 20
                )`);
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
                )`, [], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
        });
        // Create test employee
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO employees (name, email, department, leaveBalance) VALUES (?, ?, ?, ?)',
                ['Test Employee', 'test@example.com', 'HR', 20],
                function(err) {
                    if (err) reject(err);
                    employeeId = this.lastID;
                    resolve();
                }
            );
        });
    });

    afterAll(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    test('POST /api/leaves should create new leave request', async () => {
        const newLeave = {
            employeeId: employeeId,
            startDate: '2024-03-20',
            endDate: '2024-03-21',
            reason: 'Vacation',
            type: 'ANNUAL'
        };

        const response = await request(app)
            .post('/api/leaves')
            .send(newLeave);

        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
            employeeId: employeeId,
            startDate: newLeave.startDate,
            endDate: newLeave.endDate,
            reason: newLeave.reason,
            type: newLeave.type,
            status: 'PENDING'
        });
    });

    test('GET /api/employees/:id/leaves should return employee leave requests', async () => {
        const response = await request(app).get(`/api/employees/${employeeId}/leaves`);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
});