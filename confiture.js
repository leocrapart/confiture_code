const express = require("express")
const path = require("path")
const formidable = require("formidable")
const body_parser = require("body-parser")
const edit_json = require("edit-json-file")

const parent_dirname = path.dirname(__dirname)
const products_file_path = path.join(parent_dirname, "database", "products.json")
console.log(products_file_path)
const app = express()
const products = require(products_file_path)

app.set("view engine", "pug")
app.use(express.static(path.join(parent_dirname, "public")))
app.set("views", path.join(__dirname, "views"))


// FORM MANAGE
app.use(body_parser.urlencoded({extended: true}))

app.post("/upload_product", (req, res) => {
    //DATA

    const product_type = req.body.product_type
    const nom = req.body.nom
    const id = req.body.id
    console.log(id)
    const prix1 = Number(req.body.prix1)
    const prix2 = Number(req.body.prix2)
    const prix3 = Number(req.body.prix3)
    const img_src = req.body.img_src
    const description = req.body.description
    const composition = req.body.composition
    const poids1 = Number(req.body.poids1)
    const poids2 = Number(req.body.poids2)
    const poids3 = Number(req.body.poids3)
    const file = edit_json(products_file_path, {autosave: true})
    file.set(`${product_type}.${id}.nom`, nom)
    file.set(`${product_type}.${id}.id`, id)
    file.set(`${product_type}.${id}.img_src`, img_src)
    file.set(`${product_type}.${id}.description`, description)
    file.set(`${product_type}.${id}.composition`, composition)
    file.set(`${product_type}.${id}.description`, description)
    file.set(`${product_type}.${id}.prix.prix1`, prix1)
    file.set(`${product_type}.${id}.prix.prix2`, prix2)
    file.set(`${product_type}.${id}.prix.prix3`, prix3)
    file.set(`${product_type}.${id}.poids.poids1`, poids1)
    file.set(`${product_type}.${id}.poids.poids2`, poids2)
    file.set(`${product_type}.${id}.poids.poids3`, poids3)
    file.set(`${product_type}.${id}.active`, true)
    //DATA
    
    
    res.redirect("/upload")
})


//end
app.get("/", (req, res) => {
    res.render("index", {
        confitures: products.confiture,
        confiseries: products.confiserie
    })
})

app.post("/switch_state", (req, res) => {
    const id = req.body.id
    const product_type = req.body.product_type

    const file = edit_json(products_file_path, {autosave: true})
    const activity = products[product_type][id].active
    file.set(`${product_type}.${id}.active`, !activity)
    res.redirect("/stock")
})

app.post("/delete", (req, res) => {
    const id = req.body.id
    const product_type = req.body.product_type
    const file = edit_json(products_file_path, {autosave: true})
    file.unset(`${product_type}.${id}`)
    res.redirect("/stock")
})

app.get("/stock", (req, res) => {
    res.render("stock", {
        confitures: products.confiture,
        confiseries: products.confiserie
    })
})

app.get("/contact", (req, res) => {
    res.render("contact")
})


app.get("/reseau", (req, res) => {
    res.render("reseau")
})

app.get("/confiture", (req, res) => {
    if (req.query.id) {
        const produit = products.confiture[req.query.id]
        res.render("confitures/produit", {
            confiture: produit
        })
    } else {
        res.render("confitures/index", {
            confitures: products.confiture
        })
    }
})

app.get("/confiserie", (req, res) => {
    if (req.query.id) {
        const produit = products.confiserie[req.query.id]
        res.render("confiseries/produit", {
            confiserie: produit
        })
    } else {
        res.render("confiseries/index", {
            confiseries: products.confiserie
        })
    }
})

app.get("/upload", (req, res) => {
    res.render("upload")
})

app.get("/connect", (req, res) => {
    res.render("password")
} )

app.post('/upload_img', function (req, res){
    //IMG
    const form = new formidable.IncomingForm();
    const MB = 1024 * 1024
    form.maxFileSize = 10 * MB
    form.parse(req);

    form.on('fileBegin', function (name, file){
        file.path = path.join(parent_dirname, "public", "img", file.name)
    });

    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name)
    });
    //IMG
    res.render("upload");
});




const port = 8080
app.listen(port)