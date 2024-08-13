const dotenv = require('dotenv');
dotenv.config();
const express = require('express');

const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rokade = require('./Componenter/bestyrelserokade');
const nodemailer = require('nodemailer');
const inLineCss = require('nodemailer-juice');
const mail = require('./Componenter/mail');
const register = require('./Componenter/register');
const signin = require('./Componenter/signin');
const hentliste = require('./Componenter/hentliste')
const hentBrugere = require('./Componenter/hentBrugere');
const post = require('./Componenter/post');
const fjern = require('./Componenter/fjern');
const hent = require('./Componenter/hent');
const nybegivenhed = require('./Componenter/nybegivenhed');
const bruger = require('./Componenter/profile');
const nyInfo = require('./Componenter/nyinfo');
const billeder = require('./Componenter/billeder');
const mangeBilleder = require('./Componenter/mangeBilleder');
const hentBilleder = require('./Componenter/hentBilleder');

const dbUsername = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
if (!dbUsername) {
    throw new Error('DB_USERNAME environment variables must be set');
}
if (!dbPassword) {
    throw new Error('DB_PASSWORD environment variables must be set');
}
const passport = require('passport');
const passportJwt = require('passport-jwt');
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const knex = require('knex');
const knexDb = knex({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: dbUsername,
        password: dbPassword,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
    }
});

const bookshelf = require('bookshelf');
const securePassword = require('./middleware/bookshelf-secure-password');
const headersAuth = require('./middleware/auth');
const upload = require('./middleware/billeder');
const db = bookshelf(knexDb);
db.plugin(securePassword);

const User = db.Model.extend({
    tableName: 'bruger',
    hasSecurePassword: true
});

const PORT = process.env.PORT || 3002;

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_OR_KEY
};

const serverPath = '/sks'
//app.use(`*/bestyrelsen`, express.static(`public/bestyrelsen`));
//app.use(`*/logoer`, express.static(`public/logoer`));


const strategy = new JwtStrategy(opts, (payload, next) => {
    User.forge({ role: payload.role, id: payload.id }).fetch().then(res => {
        next(null, res);
    });
});
passport.use(strategy);
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors());

app.get(serverPath + '/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

const auth = passport.authenticate('jwt', { session: false });

app.get(serverPath + '/tester', (req, res) => {
    const table = 'test'
    knexDb(table).select('*')
        .then(t => {
            if (t.length) {
                res.json({ message: 'ok', error: false })
            } else {
                res.status(400).json({ message: t, error: true })
            }
        })
        .catch(err => res.status(400).json({ message: err, error: true }))
})

app.post(serverPath + '/newuser', async (req, res) => { register.handleRegister(req, res, headersAuth, User, jwt, dotenv, knexDb, upload.single('billede')) });//opret bruger

app.post(serverPath + '/login', (req, res) => { signin.handleSignin(req, res, knexDb, bcrypt, jwt, dotenv) });//login

app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`)
});