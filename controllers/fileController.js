const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const query = require("../model/queries.js");
const path = require("path");
// const multer = require("multer");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const ejs = require("ejs");
const passport = require("passport");
const {
  uploadFile,
  downloadFile,
  getShareableLink,
  deleteStorageFile,
} = require("../model/supabase");
const { post } = require("../routes/routes.js");

const getHome = asyncHandler(async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  } else {
    let folders = await query.getFolders(req.user.id);
    const folderCreationHtml = await ejs.renderFile(
      path.join(__dirname, "../views/folderCreation.ejs")
    );
    res.render("index", {
      url: req.url,
      user: req.user,
      folders: folders,
      folderCreationHtml,
      errors: null,
    });
  }
});

const getLogin = asyncHandler(async (req, res) => {
  return res.render("login", {
    failure: req.query.failure ? true : null,
    url: req.url,
  });
});

const logOut = asyncHandler(async (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/login");
  });
});

const postLogin = asyncHandler(async (req, res, next) => {
  console.log("in postLogin");
  passport.authenticate("local", function (err, user, info) {
    
    if (err) {
      console.error("Authentication error:", err);
      return next(err); // Pass the error to the next middleware
    }
    if (!user) {
      console.log("Authentication failed: user not found");
      return res.render("login", { failure: true, url: req.url });
    }
    req.login(user, function (err) {
      if (err) {
        console.error("Login error:", err);
        return next(err); // Pass the error to the next middleware
      }
      console.log("User logged in:", user);
      return res.redirect("/");
    });
  })(req, res, next);
});

const getSignup = asyncHandler(async (req, res) => {
  return res.render("signup", { url: req.url, errors: null });
});

const postSignup = asyncHandler(async (req, res) => {
  console.log("in postSignup");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("signup", { url: req.url, errors: errors.array() });
    return;
  }
  const { userName, password } = req.body;
  console.log("userName", userName, "password", password);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    const user = await query.createUser(userName, hashedPassword);
    req.login(user, function (err) {
      if (err) {
        console.log("Error logging in user after signup:", err);
        return next(err);
      }
      return res.redirect("/");
    });
  } catch (error) {
    if (error.message === "Username already exists") {
      console.log("errors HHH", error.message);
      res.render("signup", { url: req.url, errors: error.message });
    } else {
      console.error("Error creating user:", error);
      res.status(500).send("Internal Server Error");
    }
  }
  // let files = await query.getFiles(user.userid);
  // console.log('files', files), console.log('user', user);
});

const postFileUpload = asyncHandler(async (req, res, shareLink, filePath) => {
  console.log("in postFileUpload");
 

  const user = req.user;
  const authorId = user.id;
  const folderId = parseInt(req.body.folderId);
  // console.log('authorId', authorId, 'user', user);
  // console.log('req.body', req.body);
  // console.log('req.file', req.file, 'req.file.path', req.file.path);
  // await uploadFile(req.file.path, req.file, shareLink);
  await query.saveFile(
    req.body.fileName,
    authorId,
    shareLink,
    req.file.size,
    folderId,
    filePath
  );
  res.redirect("/folder/" + req.body.folderId);
});

const postFolderCreation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let folders = await query.getFolders(req.user.id);
    const folderCreationHtml = await ejs.renderFile(
      path.join(__dirname, "../views/folderCreation.ejs")
    );
    res.render("index", {
      url: req.url,
      user: req.user,
      folders: folders,
      folderCreationHtml,
      errors: errors.array(),
    });
    return;
  }
  try {
    // let folder = await query.addFolder(req.body.inputFileName, req.user.id);
    await query.addFolder(req.body.inputFileName, req.user.id);
    res.redirect("/");
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).send("Internal Server Error");
  }
});

const updateFolderName = asyncHandler(async (req, res) => {
  console.log("IN UPDATE FOLDER");
  const errors = validationResult(req);
  console.log("errors", errors);
  if (!errors.isEmpty()) {
    let folders = await query.getFolders(req.user.id);
    const folderCreationHtml = await ejs.renderFile(
      path.join(__dirname, "../views/folderCreation.ejs")
    );
    res.render("index", {
      url: req.url,
      user: req.user,
      folders: folders,
      folderCreationHtml,
      errors: errors.array(),
    });
    return;
  }
  const folderId = req.params.id;
  const { folderName } = req.body;

  try {
    console.log("FOLDER UPDATING");
    const updatedFolder = await query.updateFolderName(
      parseInt(folderId),
      folderName
    );
    res.json(updatedFolder);
  } catch (error) {
    console.error("Error updating folder name:", error);
    res.status(500).send("Internal Server Error");
  }
});

const deleteFolder = asyncHandler(async (req, res) => {
  const folderId = req.params.id;
  
  try {
    //delete all storage files in folder
    const files = await query.getFilesByFolder(req.user.id, parseInt(folderId));
    files.forEach((file) => {
      
      deleteStorageFile(file.filePath);
    });

    //delete folder and its files from db
    await query.deleteFolder(parseInt(folderId));

    res.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).send("Internal Server Error");
  }
});

function formatFileSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

const getFolder = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    
  try {
    const user = req.user;
    const folderId = req.params.id || req.body.folderId;
    const folder = await query.getFolderById(parseInt(folderId));
    const files = await query.getFilesByFolder(user.id, parseInt(folderId));
    const filesHRSize = files.map((file) => {
      file.size = formatFileSize(file.size);
      return file;
    });
    
    res.render("folder", {
      folderName: folder.foldername,
      files: filesHRSize,
      url: req.url,
      folderId: folderId,
      errors: errors.array(),
    });
  } catch (error) {
    console.error("Error getting folder:", error);
    res.status(500).send("Internal Server Error");
  }
});

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
};

const deleteFile = asyncHandler(async (req, res) => {
 
  const fileId = req.params.id;

  try {
    const file = await query.getFileById(parseInt(fileId));
    
    const filePath = file.filePath;
    
    deleteStorageFile(filePath);
    await query.deleteFile(parseInt(fileId));
    
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).send("Internal Server Error");
  }
});

async function handleFileUpload(req, res) {
  

  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // There are validation errors
    
    return getFolder(req, res);
    };
  const user = req.user;
  const buffer = req.file.buffer;
  const fileContentType = req.file.mimetype;
  const filePath = `uploads/${user.id}/${Date.now()}/${req.file.originalname}`;
  const uploadResult = await uploadFile(filePath, buffer, fileContentType);
  if (!uploadResult) {
    return res.status(500).json({ error: "Failed to upload file" });
  }
  const fileUrl = await downloadFile(filePath);
  if (!fileUrl) {
    return res.status(500).json({ error: "Failed to get file URL" });
  }
  const shareLink = getShareableLink(filePath);
  postFileUpload(req, res, shareLink, filePath);
}

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
  getFolder,
  ensureAuthenticated,
  deleteFile,
  handleFileUpload,
};
