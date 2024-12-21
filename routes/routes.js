const { Router } = require("express");
const bodyParser = require('body-parser');

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const fileController = require('../controllers/fileController.js')

const app = Router()

app.post('/stats', upload.single('uploaded_file'), function (req, res) {
  // req.file is the name of your file in the form above, here 'uploaded_file'
  // req.body will hold the text fields, if there were any 
  console.log(req.file, req.body)
});

app.get('/', fileController.getHome)

module.exports = app