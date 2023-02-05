import './dotenv/config.js';
import 'express-async-errors';
import express from 'express';
import {utils as u} from '../utils.js';
import userRouter from './routers/user.js';
import taskRouter from './routers/task.js';
import './db/mongoose.js';

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

const errorHandler = (err, req, res, next) => {
    u.error(`Error`, `${req.path}, ${req.method}, "${err.message}"`);
    let status = err.status || 500;
    if (err?.message.toLowerCase().includes('validation failed')) {
        status = 400;
    }
    return res.status(status).json(err.message || err);
};

app.use(errorHandler);
app.listen(port, () => {
    u.log(`Server is up on port ${port}`);
});
