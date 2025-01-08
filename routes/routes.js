const { Router } = require("express");
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client') 
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const fileController = require('../controllers/fileController.js')
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const prisma = require('../model/client.js')

const appRouter = Router()

appRouter.use(bodyParser.urlencoded({ extended: true }));
appRouter.use(
  expressSession({
    cookie: {
     maxAge: 7 * 24 * 60 * 60 * 1000 // ms
    },
    secret: process.env.SESSIONSECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      prisma,
      {
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
);
appRouter.use(passport.session());
  
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

appRouter.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

appRouter.get('/', fileController.getHome)
appRouter.get('/login', fileController.getLogin)
appRouter.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
}))
appRouter.get('/logout', fileController.logOut)
appRouter.get('/signup', fileController.getSignup)
appRouter.post('/signup', fileController.postSignup)
appRouter.post('/fileupload', upload.single('uploaded_file'), fileController.postFileUpload);
appRouter.post('/folderCreation', fileController.postFolderCreation);
appRouter.post('/update-folder/:id', fileController.updateFolderName);
appRouter.delete('/delete-folder/:id', fileController.deleteFolder);
module.exports = appRouter