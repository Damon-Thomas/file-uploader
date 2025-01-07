const asyncHandler = require("express-async-handler");
const query = require("../model/queries.js");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
require('dotenv').config();

const getHome = asyncHandler(async (req, res) => {  
    if (!req.isAuthenticated()) {
        return res.redirect('/login', currentUrl = req.url);
    } else { 
        console.log('authenticated', req.isAuthenticated(), req.user);
        let files = await query.getFiles(req.user.userid);
        console.log(req.url)
        return res.render('index', { user: req.user, files: files, currentUrl: req.url });
    }
});

const getLogin = asyncHandler(async (req, res) => {

    return res.render('login', {failure: req.query.failure ? true: null, currentUrl: req.query.currentUrl});
});

const logOut = asyncHandler(async (req, res) => {
    req.logout((err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/login", currentUrl = req.url);
      });
})

const postLogin = asyncHandler(async (req, res, getHome, errorPage) => {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return errorPage(err); }
        if (!user) { return res.redirect('/login', {failure: null}); }

        req.login(user, function(err) {
            if (err) { return errorPage(err); }
            console.log('user', user);
            getHome(req, res);
        });
    })(req, res);
});

const getSignup = asyncHandler(async (req, res) => {
    return res.render('signup', {errors: null});
});

const postSignup = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('signup', { errors: errors.array() });
    }
    const { userName, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await query.createUser(userName, hashedPassword);
    let files = await query.getFiles(user.userid);
    console.log('files', files), console.log('user', user);
    res.render('index', {files: files, user: user});
});

const postFileUpload = asyncHandler(async (req, res, getHome) => {
    console.log('req.body', req.body);
    console.log('req.file', req.file);
    query.saveFile(req.file.filename, req.user.userid, req.file);
    getHome(req, res);
});

module.exports = {
    getHome,
    getLogin,
    logOut,
    postLogin,
    getSignup,
    postSignup,
    postFileUpload,
};