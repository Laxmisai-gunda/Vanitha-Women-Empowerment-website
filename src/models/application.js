import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: String, required: true },
    address: { type: String, required: true },
    jobType: { type: String, required: true, enum: ['Teacher', 'Tailor', 'Chef'] }, // Capitalized job types
    additionalInfo: { type: String } // Optional, for any specific info per job type
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;
