// backend/server.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'expenses.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Helper function to read data
const readData = (callback) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err && err.code === 'ENOENT') return callback(null, []);
        if (err) return callback(err);
        callback(null, JSON.parse(data));
    });
};

// Helper function to write data
const writeData = (data, callback) => {
    fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), callback);
};

// --- API Routes (CRUD) ---

// CREATE
app.post('/api/expenses', (req, res) => {
    readData((err, expenses) => {
        if (err) return res.status(500).send('Error reading data.');
        const newExpense = req.body;
        expenses.push(newExpense);
        writeData(expenses, (writeErr) => {
            if (writeErr) return res.status(500).send('Error saving data.');
            res.status(201).json(newExpense);
        });
    });
});

// READ
app.get('/api/expenses', (req, res) => {
    readData((err, expenses) => {
        if (err) return res.status(500).send('Error reading data.');
        res.json(expenses);
    });
});

// UPDATE
app.put('/api/expenses/:id', (req, res) => {
    const expenseId = parseInt(req.params.id, 10);
    const updatedExpense = req.body;
    readData((err, expenses) => {
        if (err) return res.status(500).send('Error reading data.');
        const index = expenses.findIndex(exp => exp.id === expenseId);
        if (index === -1) return res.status(404).send('Expense not found.');
        
        expenses[index] = updatedExpense;
        writeData(expenses, (writeErr) => {
            if (writeErr) return res.status(500).send('Error saving data.');
            res.json(updatedExpense);
        });
    });
});

// DELETE
app.delete('/api/expenses/:id', (req, res) => {
    const expenseId = parseInt(req.params.id, 10);
    readData((err, expenses) => {
        if (err) return res.status(500).send('Error reading data.');
        const filteredExpenses = expenses.filter(exp => exp.id !== expenseId);
        if (expenses.length === filteredExpenses.length) {
            return res.status(404).send('Expense not found.');
        }

        writeData(filteredExpenses, (writeErr) => {
            if (writeErr) return res.status(500).send('Error saving data.');
            res.status(204).send(); // 204 No Content for successful deletion
        });
    });
});

app.listen(PORT, () => {
    console.log(`✅ Backend server is running at http://localhost:${PORT}`);
});