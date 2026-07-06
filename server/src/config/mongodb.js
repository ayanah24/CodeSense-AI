import mongoose from 'mongoose';
import 'dotenv/config';

async function connectMongoDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/codesense');
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

export default connectMongoDB;
