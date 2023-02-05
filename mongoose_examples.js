import mongoose from 'mongoose';
import {utils as u} from './utils.js';
import validator from 'validator';

async function main() {
    mongoose.set('strictQuery', false);
    await mongoose.connect('mongodb://127.0.0.1:27017/task-manager', {})
}

main().then().catch(u.error);

const User = mongoose.model('User', {
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number');
            }
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        required: true,
        type: String,
        minLength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"');
            }
        }
    }
});

async function saveUser() {
    const me = new User({email: 'AS@as.ru', name: '  Rob  ', password: '123456'});
    u.log('me', me);
    await me.save()
}

// saveUser().then().catch(u.error);

const Task = mongoose.model('Task', {
    description: {
        required: true,
        trim: true,
        type: String
    },
    completed: {
        type: Boolean,
        default: false
    }
});

async function saveTask() {
    const task = new Task({description: 'to do 2'});
    return await task.save()
}

saveTask().then(s => u.log('save new task', s)).catch(u.error);