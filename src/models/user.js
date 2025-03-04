import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    age: Number,
    gender: String,
    mobileNumber: String,
    profession: String,
    address: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

export default User;
