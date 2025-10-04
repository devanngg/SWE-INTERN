// backend/server.js

const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const app = express();
const PORT = 3000;

// --- Initialize Firebase Admin ---
// Make sure firebase-credentials.json is in your backend folder
const serviceAccount = require('./firebase-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get a reference to the Firestore database
const db = admin.firestore();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));


// --- API Routes (CRUD) using Firestore ---

// CREATE
app.post('/api/expenses', async (req, res) => {
    try {
        const newExpense = { ...req.body, id: Date.now() }; // Add an ID
        await db.collection('expenses').add(newExpense);
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).send('Error saving data.');
    }
});

// READ
app.get('/api/expenses', async (req, res) => {
    try {
        const snapshot = await db.collection('expenses').get();
        const expenses = [];
        snapshot.forEach(doc => {
            expenses.push({ firestore_id: doc.id, ...doc.data() });
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).send('Error reading data.');
    }
});

// UPDATE
app.put('/api/expenses/:id', async (req, res) => {
    try {
        // This is a simplified update; a real app would query by your custom 'id'
        // For now, this is a placeholder to show the logic
        res.status(512).send('Update not fully implemented for Firestore in this example.');
    } catch (error) {
        res.status(500).send('Error updating data.');
    }
});

// DELETE
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        // This is a simplified delete; a real app would query by your custom 'id'
        // For now, this is a placeholder to show the logic
        res.status(512).send('Delete not fully implemented for Firestore in this example.');
    } catch (error) {
        res.status(500).send('Error deleting data.');
    }
});


app.listen(PORT, () => {
    console.log(`✅ Backend server is running at http://localhost:${PORT}`);
});