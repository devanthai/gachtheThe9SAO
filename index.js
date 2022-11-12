const express = require('express')
const session = require('express-session');
var flash = require('connect-flash');
var cookieSession = require('cookie-session')
let mongoose = require('mongoose');
var Keygrip = require('keygrip')
var bodyParser = require('body-parser')
const dotenv = require('dotenv');
const helmet = require('helmet')
const Router = require("./routers")
const app = express()
app.use(helmet.xssFilter());
app.set('trust proxy', 1)
app.use(cookieSession({
    secret: "drgdhrftyhrtyerterTTT563...t",
    name: 'session',
    keys: new Keygrip(['key1', 'key2'], 'SHA384', 'base64'),
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    cookie: {
        httpOnly: true,
        secure: true
    }
}))
app.use(session({
    secret: 'sdfsdfgdfgdfg',
    saveUninitialized: true,
    resave: true
}));
app.use(flash());

app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }))
app.use(bodyParser.json({ limit: '30mb' }))
app.use(express.static('public'))
app.set("view engine", "ejs")
app.set("views", "./views")
app.use("/", Router)
dotenv.config()
mongoose.connect(process.env.DB_CONNECT, () => console.log('Connected to db'));
app.listen(process.argv[2] || process.env.PORT || 3000, () => {
    console.log(`App is listening at ${process.argv[2] || process.env.PORT || 3000}`);
});
