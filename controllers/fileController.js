const asyncHandler = require("express-async-handler");
const query = require("../model/queries.js");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
require('dotenv').config();
const multer  = require('multer')
const upload = multer({ dest: './public/data/uploads/' })
const path = require('path');
const ejs = require('ejs');
const passport = require('passport');



const getHome = asyncHandler(async (req, res) => {  
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    } else { 
        console.log('authenticated', req.isAuthenticated(), req.user);
        let folders = await query.getFolders(req.user.userid);
        console.log('url', req.url)
        console.log('folder', folders);
        // modified ai code
        const folderCreationHtml = await ejs.renderFile(path.join(__dirname, '../views/folderCreation.ejs'));
        res.render('index', { currentUrl: req.url, user: req.user, folders: folders, folderCreationHtml });
        // mine commented out
        // return res.render('index', { user: req.user, folders: folders, currentUrl: req.url });
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
        res.redirect("/login");
      });
})

const postLogin = asyncHandler(async (req, res) => {
    console.log('in postLogin');
    passport.authenticate('local', function(err, user, info) {
        if (err) { return errorPage(err); }
        req.login(user, function(err) {
            if (err) { 
            console.log('user', user);
            res.redirect('/login');}
        });
        if (!user) { return res.render('login', {failure: null}); }
    })(req, res);
});

const getSignup = asyncHandler(async (req, res) => {
    return res.render('signup', {errors: null});
});

const postSignup = asyncHandler(async (req, res) => {
    console.log('in postSignup');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('signup', { errors: errors.array() });
    }
    const { userName, password } = req.body;
    console.log('userName', userName, 'password', password);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try{
        const user = await query.createUser(userName, hashedPassword);
        req.login(user, function(err) {
            if (err) { 
                console.log('Error logging in user after signup:', err);
                return next(err);
            }
            return res.redirect('/');
        });
    }
    catch (error) {
        if (error.message === 'Username already exists') {
            console.log('errors', error);
          res.render('signup', { errors: [{ msg: error.message }] });
        } else {
          console.error('Error creating user:', error);
          res.status(500).send('Internal Server Error');
        }
      }
    // let files = await query.getFiles(user.userid);
    // console.log('files', files), console.log('user', user);
    
});

const postFileUpload = asyncHandler(async (req, res) => {
    console.log('req.body', req.body);
    console.log('req.file', req.file);
    getHome(req, res);
});

const postFolderCreation = asyncHandler(async (req, res) => {
    try {
        console.log('req.body', req.body.inputFileName);
        console.log('req.user', req.user);
        let folder = await query.addFolder(req.body.inputFileName, req.user.id);
        console.log('passed folder', folder);
        res.redirect('/');
        
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).send('Internal Server Error');
    }
});

const updateFolderName = asyncHandler(async (req, res) => {
    const folderId = req.params.id;
    const { folderName } = req.body;
    console.log('folderName', folderName);
    console.log(req.body)
    console.log(req.params)
  try {
    console.log('folderId', folderId, typeof folderId);
    const updatedFolder = await query.updateFolderName(parseInt(folderId), folderName);
    res.json(updatedFolder);
  } catch (error) {
    console.error('Error updating folder name:', error);
    res.status(500).send('Internal Server Error');
  }
});

const deleteFolder = asyncHandler(async (req, res) => {
    const folderId = req.params.id;
    console.log("in controller", folderId);
    try {
      await query.deleteFolder(parseInt(folderId));
  
      res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
      console.error('Error deleting folder:', error);
      res.status(500).send('Internal Server Error');
    }
  });    

module.exports = {
    getHome,
    getLogin,
    logOut,
    postLogin,
    getSignup,
    postSignup,
    postFileUpload,
    postFolderCreation, 
    updateFolderName,
    deleteFolder,
};