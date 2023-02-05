import validator from 'validator';
import mongoose from 'mongoose';
import {utils} from '../../utils.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import errors from '../errors.js';
import Task from './task.js';

const userSchema = new mongoose.Schema({
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
        unique: true,
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
    },
    //  сохраняем чтобы дать возможность разлогиниться + массив, так как залогиниться с нескольких устройств
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

// добавляем метод (генерация токена) конкретному пользователю ([user] in route)
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({id: user._id.toString()}, process.env.JWT_SECRET, {});
    user.tokens = user.tokens.concat({token})
    await user.save();
    return token;
}

// удаляем лишние проперти ненужные для паблик апи, переопределяе метод toJSON, который в mongoose возвращает this
userSchema.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject(); // toObject - mongoose method
    delete userObj.password;
    delete userObj.tokens;
    delete userObj.avatar;
    return userObj;
}

userSchema.methods.updateUser = async function (body) {
    const user = this;
    const updates = Object.keys(body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        throw new errors.BadRequest('Invalid updates');
    }
    updates.forEach((updateName) => user[updateName] = body[updateName]);
    await user.save();
    return user;
}

// ** use func declaration because arrow function don't bind this

//** находим пользователя в коллекции [User] и проверяем его на наличие прав
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    if (!user) {
        throw new Error('Unable to login');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Unable to login');
    }
    return user;
}

//** middleware
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    utils.log('just before saving!')
    next();
});

// Delete user tasks when user is remove
userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({owner: user._id});
    next();
});

const User = mongoose.model('User', userSchema);

export default User;
