import mongoose from 'mongoose';

// Connection string to your MongoDB database
const dbURI = 'mongodb://localhost:27017/blockchainProjectDB'; // Replace with your actual database name

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(dbURI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;

