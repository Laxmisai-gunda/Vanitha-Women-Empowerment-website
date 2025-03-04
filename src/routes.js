// src/routes.js
import express from 'express';
import multer from 'multer';
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing
import jwt from 'jsonwebtoken'; // Import jwt for token handling
import Complaint from './models/complaint.js'; // Keep only this import at the top of the file
import User from './models/user.js';
import Application from './models/application.js';
import cors from 'cors';
const app = express();
app.use(cors());

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Replace with your actual secret key
router.use(cors());
// Sign-up route
router.post('/signup', async (req, res) => {
    const { firstName, lastName, age, gender, mobileNumber, profession, address, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            age: Number(age), // Convert age to a number
            gender,
            mobileNumber,
            profession,
            address,
            email,
            password: hashedPassword // Store hashed password
        });

        await newUser.save();
        res.status(200).json({ message: 'User saved successfully' });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'Error saving user' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Compare hashed password with provided password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { 
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate a JWT token here and send it back
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // Replace with your secret key
        res.status(200).json({ message: 'Login successful', token }); // Send back the token
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Middleware to authenticate user based on JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) return res.sendStatus(403); // Forbidden

    jwt.verify(token, JWT_SECRET, (err, user) => { // Replace with your secret key
        if (err) return res.sendStatus(403); // Forbidden
        req.userId = user.id; // Assuming user ID is stored in token
        next();
    });
};

// Fetch user profile
router.get('/user/profile', authenticateJWT, async (req, res) => {
    const userId = req.userId; // Get userId from middleware

    try {
        const user = await User.findById(userId).select('-password'); // Exclude password field
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update user profile
router.put('/user/profile', authenticateJWT, async (req, res) => {
    const userId = req.userId; // Get userId from middleware

    const { firstName, lastName, age, gender, mobileNumber, profession, address } = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, {
            firstName,
            lastName,
            age,
            gender,
            mobileNumber,
            profession,
            address
        }, { new: true, runValidators: true }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ success: true, user }); // Return updated user details
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Other routes for handling complaints...

// Define multer storage for handling complaint images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Route to handle complaint submissions
router.post('/complaints', upload.array('images'), async (req, res) => {
    try {
        const { incidentDate, incidentTime, title, description, address } = req.body;
        const images = req.files.map(file => file.path);

        const complaint = new Complaint({
            incidentDate,
            incidentTime,
            title,
            description,
            address,
            images,
            status: 'Pending',
            userId: req.userId // Link complaint to user (via authentication)

        });

        await complaint.save();
        res.status(201).json({ message: 'Complaint submitted successfully' });

    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ message: 'Error submitting complaint' });
    }
});


// Fetch all complaints
// Route to get all complaints
router.get('/complaints', async (req, res) => {
    try {
        const complaints = await Complaint.find();
        res.json(complaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: 'Error loading complaints' });
    }
});

// Delete complaint by ID
router.delete('/complaints/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Complaint.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.status(200).json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        console.error('Error deleting complaint:', error);
        res.status(500).json({ message: 'Error deleting complaint' });
    }
});

// Route to get a specific complaint by ID
router.get('/complaints/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        res.json(complaint);
    } catch (error) {
        console.error('Error fetching complaint details:', error);
        res.status(500).json({ error: 'Failed to load complaint details' });
    }
});

// Update complaint status to "Reviewed"
router.put('/complaints/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'Reviewed') {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    try {
        const complaint = await Complaint.findById(id);
        
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        complaint.status = status;
        await complaint.save();
        res.json({ message: 'Complaint status updated to Reviewed' });
    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({ message: 'Error updating complaint status' });
    }
});

router.post('/applications', upload.single('resume'), async (req, res) => {
    try {
        const { firstName, lastName, age, gender, mobileNumber, qualification, experience, address, jobType, additionalInfo } = req.body;
        const resume = req.file ? req.file.path : null; // Save the file path

        const application = new Application({
            firstName,
            lastName,
            age,
            gender,
            mobileNumber,
            qualification,
            experience,
            address,
            jobType,
            resume,
            additionalInfo
        });

        await application.save();
        res.status(201).json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Error submitting application' });
    }
});

router.get('/admin/applications', async (req, res) => {
    try {
        const jobTypeFilter = req.query.jobType;
        let filter = {};

        if (jobTypeFilter) {
            filter.jobType = jobTypeFilter;
        }

        const applications = await Application.find(filter);
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
});

router.post('/feedback', async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        const newFeedback = new Feedback({ rating, feedback });
        await newFeedback.save();
        res.status(201).json({ message: "Feedback submitted successfully." });
    } catch (error) {
        console.error("Error saving feedback:", error);
        res.status(500).json({ message: "Error submitting feedback." });
    }
});

router.get('/feedback', async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        res.json(feedbacks);
    } catch (error) {
        console.error("Error retrieving feedback:", error);
        res.status(500).json({ message: "Error retrieving feedback." });
    }
});

export default router;