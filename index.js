const express = require('express');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse the incoming requests with JSON payloads
app.use(cors());

const users = [
    {
        id: 1,
        username: 'admin',
        password: 'admin',
    },
    {
        id: 2,
        username: 'guest',
        password: 'guest',
    },
];

const jwtCheck = expressJwt({
    secret: `${process.env.JWT_SECRET}`,
});

app.get('/resource', (req, res) => {
    res.status(200).send(`Public resource, you can see this.`);
});

app.get('/resource/secret', jwtCheck, (req, res) => {
    res.status(200).send(
        `Secret resource, you should be logged in to see this.`
    );
});

app.post('/login', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.status(400).send(`You need a username and password!`);
        return;
    }

    const user = users.find((u) => {
        return (
            u.username === req.body.username && u.password === req.body.password
        );
    });

    if (!user) {
        res.status(401).send(`User not found!`);
        return;
    }

    const token = jwt.sign(
        {
            sub: user.id,
            username: user.username,
        },
        `${(jwtCheck, { expiresIn: '3 hours' })}`
    );

    res.status(200).send({ access_token: token });
});

app.get('/status', (req, res) => {
    const localTime = new Date().toLocaleString();

    res.status(200).json({
        status: `Server time is ${localTime}.`,
    });
});

app.get('*', (req, res) => {
    res.sendStatus(404);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
