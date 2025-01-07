const asyncHandler = require("express-async-handler");
const query = require("../model/queries.js");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
require('dotenv').config();

const getHome = asyncHandler(async (req, res) => {  
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    } else { 
        console.log('authenticated', req.isAuthenticated(), req.user);
        let files = await query.getFiles(req.user.userid);
        return res.render('index', { files });
    }
});

const getLogin = asyncHandler(async (req, res) => {

    return res.render('login', {failure: req.query.failure ? true: null});
});

const postLogin = asyncHandler(async (req, res, next) => {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }

        req.login(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/');
        });
    })(req, res, next);
});

const getSignup = asyncHandler(async (req, res) => {
    return res.render('signup');
});

const postSignup = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('404', { errors: errors.array() });
    }
    const { userName, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await query.createUser(userName, hashedPassword);
    res.json(user);
});

module.exports = {
    getHome,
    getLogin,
    postLogin,
    getSignup,
    postSignup
};