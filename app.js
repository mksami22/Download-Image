const express = require('express')
const bodyParser= require('body-parser')
const multer = require('multer');
const path = require('path')
const app = express();
app.use(bodyParser.urlencoded({extended: true}))
var XLSX = require("xlsx");
var fs = require('fs');

const AdmZip = require('adm-zip');
var uploadDir = fs.readdirSync(__dirname+"/public/uploads");

app.get('/',function(req,res){
  res.sendFile(__dirname + '/index.html');

});

app.post('/download', (req, res) => {

    const zip = new AdmZip();

    for(var i = 0; i < uploadDir.length;i++){
        zip.addLocalFile(__dirname+"/public/uploads/"+uploadDir[i]);
    }

    // Define zip file name
    const downloadName = `${Date.now()}.zip`;

    const data = zip.toBuffer();

    // save file zip in root directory
    zip.writeZip(__dirname+"/"+downloadName);

    // code to download zip file

    res.set('Content-Type','application/octet-stream');
    res.set('Content-Disposition',`attachment; filename=${downloadName}`);
    res.set('Content-Length',data.length);
    res.send(data);

})

var headers = {};
var rows = []
var columns = []
var data = [];
var desiredCol = "";
var imgext = "";
var links = [];

function getdata(){
  var workbook = XLSX.readFile("./public/uploads/name.xlsx");
  var sheet_name_list = workbook.SheetNames;
  sheet_name_list.forEach(function(y) {
  var worksheet = workbook.Sheets[y];
  // console.log(worksheet);
  for (z in worksheet) {
    if (z[0] === "!") continue;
    var col = z.substring(0, 1);
    columns.push(col);
    var row = parseInt(z.substring(1));
    rows.push(row);
    var firstRow = rows[0];
    var value = worksheet[z].v;
    if (row == firstRow && (value == "Name" || value == "name")) {
      desiredCol = col;
    }
    if (col == desiredCol) {
      data.push(value);
    }
  }
  });
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    var ext = file.originalname.split('.').pop();
    if(ext == 'xlsx'){
      cb(null, 'name' + path.extname(file.originalname));

    }else{
      imgext = ext
      getdata();
      console.log(data)
      for(var a = 0; a < data.length; a++){
        cb(null, data[a] + path.extname(file.originalname));
      }
      }
  }
})


var upload = multer({ storage: storage })

app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
    res.sendFile(__dirname + '/image.html');

})

//Uploading multiple files
app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
  const files = req.files
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
  }

    res.sendFile(__dirname + '/download.html');

})



app.listen(process.env.PORT || 3000, () => console.log('Server started on port 3000'));
