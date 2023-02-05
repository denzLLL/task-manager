import express from 'express';
import Task from '../models/task.js';
import errors from '../errors.js';
import auth from '../middleware/auth.js';

const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    await task.save();
    res.send(task);
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        throw new errors.BadRequest('Invalid updates');
    }

    const task = await Task.findOne({
        _id: req.params.id,
        owner: req.user._id
    });
    if (!task) {
        return res.status(404).json();
    }

    updates.forEach((updateName) => task[updateName] = req.body[updateName]);
    await task.save();
    res.send(task);
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    let task;
    try {
        task = await Task.findOne({
            _id,
            owner: req.user._id
        });
        if (!task) throw new Error('');
    } catch (err) {
        return res.status(404).json(err.message);
    }
    res.send(task);
});


// matching: GET /tasks?completed=true
// pagination: GET /tasks?limit=10&skip=20
// sorting: GET /tasks?sortBy=createdAt:asc (asc это 1 , desc это -1)
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    await req.user.populate({
        path: 'tasks',
        match,
        options: {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
        }
    });
    res.send(req.user.tasks);
});

router.delete('/tasks/:id', auth, async (req, res) => {
    const task = await Task.findOneAndDelete({
        _id: req.params.id,
        owner: req.user._id
    });
    if (!task) {
        return res.status(404).json();
    }
    res.send(task);
});

export default router;
