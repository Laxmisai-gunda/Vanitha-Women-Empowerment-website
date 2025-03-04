// app.js
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes.js'; // Adjust the path as needed

const app = express();
const port = 3000;

// Convert the ES module URL to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to authenticate and set userId (this is a simplified version, implement JWT verification here)
app.use((req, res, next) => {
    // Simulate JWT middleware by setting a dummy userId
    req.userId = 'someUserId'; // Replace with real user ID from decoded JWT
    next();
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blockchainProjectDB')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Use routes
app.use('/api', router);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Render pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../public/login.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, '../public/profile.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, '../public/signup.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/dashboard.html')));
app.get('/complaint', (req, res) => res.sendFile(path.join(__dirname, '../public/complaint.html')));
app.get('/dashboard1', (req, res) => res.sendFile(path.join(__dirname, '../public/dashboard1.html')));
app.get('/VanithaServices', (req, res) => {
    const filePath = path.join(__dirname, '../public/VanithaServices.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(err.status).end();
        }
    });
});
// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
