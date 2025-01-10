const { body } = require("express-validator");



const fileSanitization = [
body('fileName').trim().isLength({ min: 1 }).withMessage('File name is required').escape(),

];

const folderSanitization = [
    body('inputFileName').trim().isLength({ min: 1 }).withMessage('Folder name is required').escape(),
];

const folderUpdateSanitization = [
    body('folderName').trim().isLength({ min: 1 }).withMessage('Folder name is required').escape(),
];


module.exports = {
    fileSanitization,
    folderSanitization,
    folderUpdateSanitization
};