import mongoose from 'mongoose';
import {utils as u} from '../../utils.js';

async function connectToMongodb() {
    mongoose.set('strictQuery', false);
    await mongoose.connect(`${process.env.MONGODB_URL}`, {})
}

connectToMongodb().then(() => u.log(`Mongo Server ${process.env.MONGODB_URL} is up`)).catch(u.error);
