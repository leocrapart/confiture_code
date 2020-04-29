const express = require("express")
const app = express()
const path = require("path")
const formidable = require("formidable")


app.set("view engine", "pug")
app.use(express.static(path.join(__dirname, "public")))
app.set("views", path.join(__dirname, "views"))

app.get("/upload", (req, res) => {
    res.render("upload")
})


app.post('/submit-form', function (req, res){
    var form = new formidable.IncomingForm();

    form.parse(req);

    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/uploads/' + file.name;
    });

    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
    });

    res.render("upload");
});

app.listen(8080)
