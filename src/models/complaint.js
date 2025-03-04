import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
     incidentDate: { type: Date, required: true, default: Date.now },
     incidentTime: { type: String, required: true },
     title: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    images: [{ type: String }]
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
