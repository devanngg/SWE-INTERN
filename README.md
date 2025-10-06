✨ Personal Expense Tracker
A full-stack web application designed to help users track their personal expenses. This project features a responsive frontend, a powerful Node.js backend, and integration with Google's Firebase (Firestore) for persistent data storage.

This project was built as an assignment for the Evaao internship application.

## Features
Full CRUD Operations: Add, view, update, and delete expenses seamlessly.

Persistent Storage: Expense data is securely stored in a cloud-based Firestore database.

Summary Reports: View summaries of total spending, with breakdowns by category and by month.

Advanced Filtering: Filter the expense list by category or a specific date range.

Interactive UI: A clean, modern, and responsive user interface with multiple themes (Light & Dark mode).

RESTful API: A well-structured backend API built with Node.js and Express to handle all data logic.

Deployment Ready: Configured for easy deployment on platforms like Vercel.

## Tech Stack
Frontend: HTML5, CSS3, JavaScript (ES6+)

Backend: Node.js, Express.js

Database: Google Firestore (via firebase-admin SDK)

Deployment: Vercel

## Project Structure
The project is organized into a clean frontend/backend structure:

/personal-expense-tracker
├── 📁 frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── 📁 backend/
    ├── server.js
    ├── firebase-credentials.json  (You must provide your own)
    ├── node_modules/
    └── package.json
## 🔧 Setup and Installation (Local)
To get this project running on your local machine, follow these steps.

### Prerequisites
Node.js (which includes npm) installed on your system.

A Google Firebase project with Firestore enabled.

### 1. Clone the Repository
Clone this project to your local machine.

Bash

git clone <your-repository-url>
cd <your-project-folder>
### 2. Set Up Firebase Credentials
From your Firebase project dashboard, generate a new private key (Project settings > Service accounts > Generate new private key).

A JSON file will be downloaded. Rename it to firebase-credentials.json.

Place this file inside the backend folder.

### 3. Install Backend Dependencies
Navigate into the backend folder and install the necessary npm packages.

Bash

cd backend
npm install
(This will install express and firebase-admin)

### 4. Run the Server
Start the Node.js server.

Bash

node server.js
You should see a confirmation message in your terminal: ✅ Backend server is running at http://localhost:3000

### 5. Access the Application
Open your web browser and navigate to:
http://localhost:3000

The application should be fully functional.

## 🚀 API Endpoints
The backend provides the following API endpoints to manage expenses:

Method	Endpoint	Description
GET	/api/expenses	Get a list of all expenses.
POST	/api/expenses	Add a new expense.
PUT	/api/expenses/:id	Update an existing expense.
DELETE	/api/expenses/:id	Delete an expense.

