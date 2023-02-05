import express from 'express';
import User from '../models/user.js';
import auth from '../middleware/auth.js';
import multer from 'multer';
import user from '../models/user.js';
import sharp from 'sharp';

const router = new express.Router();

router.post('/users', async (req, res) => {
    const {email, password, name} = req.body;
    const user = new User({email, name, password});
    await user.save();
    const token = await user.generateAuthToken();

    res.send({user, token});
});

router.post('/users/login', async (req, res) => {
    // в модели создадим ф-ю findByCredentials для проверки прав пользователя на логин
    const user = await User.findByCredentials(req.body.email, req.body.password);
    // тк мы не работаем с коллекцией юзеров (User), то создадим ф-ю для спец юзера (user):
    const token = await user.generateAuthToken();
    res.send({user, token});
});

router.post('/users/logout', auth, async (req, res) => {
    req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token;
    });
    await req.user.save();
    res.send();
});

router.post('/users/logoutAll', auth, async (req, res) => {
    req.user.tokens = [];
    await req.user.save();
    res.send();
});

router.patch('/users/me', auth, async (req, res) => {
    const user = await req.user.updateUser(req.body);
    res.send(user);
});

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;
    let user;
    try {
        user = await User.findById(_id).exec();
    } catch (err) {
        return res.status(404).json(err.message); // set custom status
    }
    res.send(user);
});

// use mw auth (ex. но в бою этот запрос должен быть убран, тк нам не надо показывать всею юзеров залог-ся юзерам)
router.get('/users', auth, async (req, res) => {
    const users = await User.find({}).exec();
    res.send(users);
});

router.delete('/users/me', auth, async (req, res) => {
    await req.user.remove()
    res.send(req.user);
});

// upload
const upload = multer({
    // dest: `${process.cwd()}/images/avatars`, // не используем тк будем сохранять в бд
    limits: {
        fileSize: 1000000 // 1Mb
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/.(png|jpg|jpeg)$/)) {
            return cb(new Error('File must be a .png or .jpg'));
        }
        cb(undefined, true);
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
    const _id = req.params.id;
    let user;
    try {
        user = await User.findById(_id).exec();
        if (!user || !user.avatar) {
            throw new Error('');
        }
    } catch (err) {
        return res.status(404).json(err.message);
    }
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
});
// end upload

export default router;
