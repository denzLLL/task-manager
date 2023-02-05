import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    description: {
        required: true,
        trim: true,
        type: String
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // ссылка на модель User
    }
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
