const express = require("express")
const path = require("path")
const formidable = require("formidable")
const body_parser = require("body-parser")
const edit_json = require("edit-json-file")
const session = require("express-session")

const parent_dirname = path.dirname(__dirname)
const products_file_path = path.join(parent_dirname, "database", "products.json")
const people_file_path = path.join(parent_dirname, "database", "people.json")

const app = express()
const products = require(products_file_path)
const people = require(people_file_path)

app.set("view engine", "pug")
app.use(express.static(path.join(parent_dirname, "public")))
app.set("views", path.join(__dirname, "views"))

//session
app.use(session({
    secret: 'ougzgrz54gze4gze8',
    resave: true,
    saveUninitialized: true
}));
app.use((req,res,next) => {
    res.locals.session = req.session;
    next();
});

// FORM MANAGE
app.use(body_parser.urlencoded({extended: true}))


app.post("/log-out", (req,res) => {
    req.session.destroy()
    res.redirect("/")
})
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

app.post("/modify_product", (req, res) => {
    const file = edit_json(products_file_path, {autosave: true})
    const product_type = req.body.product_type
    const id = req.body.id
    const attributes = ["nom", "id", "img_src", "description", "composition", "prix.prix1", "prix.prix2", "prix.prix3", "poids.poids1", "poids.poids2", "poids.poids3", "quantity"]
    const new_data = [req.body.nom, req.body.id, req.body.img_src, req.body.description, req.body.composition, Number(req.body.prix1), Number(req.body.prix2), Number(req.body.prix3), Number(req.body.poids1), Number(req.body.poids2), Number(req.body.poids3), req.body.quantity]
    
    for(let i=0; i<attributes.length; i++) {
        const attribute = attributes[i]
        const new_data_item = new_data[i]
        console.log(attribute, new_data_item)
        if ((new_data_item || new_data_item==0) && attribute != "id") {
            console.log(attribute, new_data_item)
            console.log(`${product_type}.${id}.${attribute}`)
            file.set(`${product_type}.${id}.${attribute}`, new_data_item)
        }
    }
    
    res.redirect("/stock")
})

//end
app.get("/", (req, res) => {
    res.render("index", {
        confitures: products.confiture,
        confiseries: products.confiserie
    })
})

app.get("/settings", (req, res) => {
    res.render("log/settings")
})

app.get("/sign-in", (req, res) => {
    res.render("log/sign-in")
})

app.post("/sign-in", (req, res) => {
    const email = req.body.email
    const password = req.body.password
    let error_msg = ""
    
    if (people[email].email == email && people[email].password == password) {
        req.session.loggedIn = true
        req.session.email = email
        req.session.password = password
        req.session.status = people[email].status
        res.redirect("/")
    } else {
        error_msg = "Incorrect Email and/or Password"
        res.render("sign-in", {
            alert : {msg : error_msg},
            data : { email : email}
        })
    }
    
    
})

app.get("/sign-up", (req, res) => {
    res.render("log/sign-up")
})

app.post("/sign-up", (req, res) => {
    let error_msg = ""
    const success_msg = "Successfully registered"
    const email = req.body.email
    const password = req.body.password
    const password_check = req.body.password_check
    
    if (password != password_check) {
        error_msg = "The two password aren't identical"
        res.send('Incorrect Username and/or Password!')
        res.render("sign-up", {
            alert : {msg : error_msg,
                     status : "error"},
            data : { email : email}
        })
    } else {
        const file = edit_json(people_file_path, {autosave: true})
        const escaped_mail = escaped_email(email)
        file.set(`${escaped_mail}.email`, email)
        file.set(`${escaped_mail}.password`, password)
        file.set(`${escaped_mail}.status`, "customer")

        
        res.render("log/sign-in", {
            alert : {msg : success_msg,
                     status : "success"},
            data : { email : email}
        })
    }
})

const escaped_email = (email) => {
    let new_email = ""
    let after_at = false;
    for (let i=0; i< email.length; i++) {
        if (email[i] == ".") {
            new_email += "\\."
        } else {
            new_email += email[i]
        }
    }
    return new_email
}


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
    res.render("admin/stock", {
        confitures: products.confiture,
        confiseries: products.confiserie
    })
})

app.get("/contact", (req, res) => {
    res.render("contact")
})


app.get("/reseau", (req, res) => {
    res.render("admin/reseau")
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
    res.render("admin/upload", {
        status: req.session.status
    })
})


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