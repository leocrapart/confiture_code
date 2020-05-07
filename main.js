const express = require("express")
const path = require("path")
const formidable = require("formidable")
const body_parser = require("body-parser")
const session = require("express-session")

const parent_dirname = path.dirname(__dirname)

const app = express()

app.set("view engine", "pug")
app.use(express.static(path.join(parent_dirname, "public")))
app.set("views", path.join(__dirname, "views"))
app.use(body_parser.urlencoded({extended: true}))

app.use(session({
    secret: 'ougzgrz54gze4gze8',
    resave: true,
    saveUninitialized: true
}));
app.use((req,res,next) => {
    res.locals.session = req.session;
    next();
});

const low = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")


const database_path = path.join(parent_dirname, "database", "database.json")

const adapter = new FileSync(database_path)
const db = low(adapter)

 //init db
db.defaults({users: [], products: []})
    .write()

const query = (table) => (action) => (object) => {
    db.get(table)
        [action](object)
        .write()
}
const add_user = query("users")("push")
const add_product = query("products")("push")



const leo = {email:"leocrapart@yahoo.fr", password:"leo", status:"admin" }
const enzo = {email:"crapartenzo@yahoo.fr", password: "enzo", status:"customer"}

const users = db.get("users")
                .value()

const data_types = db.get("data_types")
                    .value()

    

app.post("/log-out", (req,res) => {
    req.session.destroy()
    res.redirect("/")
})
app.post("/upload_product", (req, res) => {
    //DATA

    const prix1 = Number(req.body.prix1)
    const prix2 = Number(req.body.prix2)
    const prix3 = Number(req.body.prix3)
    const poids1 = Number(req.body.poids1)
    const poids2 = Number(req.body.poids2)
    const poids3 = Number(req.body.poids3)
    
    const product = {
        type: req.body.product_type,
        nom: req.body.nom,
        id: req.body.id,
        prix: {prix1: prix1, prix2: prix2, prix3: prix3},
        img_src: req.body.img_src,
        description: req.body.description,
        composition: req.body.composition,
        poids: {poids1: poids1, poids2: poids2, poids3: poids3},
        active: true
    }
    add_product(product)
    
    
    res.redirect("/upload")
})

const points_of = (str) => {
    let points_list = []
    for (var i=0; i<str.length; i++) {
        if (str[i] == ".") {
            points_list.push(i)
        }
    }
    return points_list
}

app.post("/modify_product", (req, res) => {
    //const file = edit_json(products_file_path, {autosave: true})
    const id = req.body.id
    console.log("id",id)
    const attributes = ["nom", "id", "img_src", "description", "composition", "prix.prix1", "prix.prix2", "prix.prix3", "poids.poids1", "poids.poids2", "poids.poids3", "quantity"]
    const new_data = [req.body.nom, req.body.id, req.body.img_src, req.body.description, req.body.composition, Number(req.body.prix1), Number(req.body.prix2), Number(req.body.prix3), Number(req.body.poids1), Number(req.body.poids2), Number(req.body.poids3), Number(req.body.quantity)]
    
    for(let i=0; i<attributes.length; i++) {
        const attribute = attributes[i]
        const new_data_item = new_data[i]
        if ((new_data_item || new_data_item==0) && attribute != "id") {
            console.log(attribute, new_data_item)
            const modified_product = db.get("products")
                .find({id: id})
                .value()
            const points_of_attribute = points_of(attribute)
            if (points_of_attribute.length !=0) {
                const first_attribute = attribute.slice(0, points_of_attribute[0])
                const list_of_attributes = [first_attribute]
                for (var j=0; j<points_of_attribute.length; j++) {
                    const next_attribute = attribute.slice(points_of_attribute[j]+1, points_of_attribute[j+1])
                    list_of_attributes.push(next_attribute)
                }
                modified_product[list_of_attributes[0]][list_of_attributes[1]] = new_data_item
                
            } else {
                modified_product[attribute] = new_data_item
            }
            
            db.write()
        }
    }
    
    res.redirect("/stock")
})

//end
const get_confitures = () => db.get("products")
                            .filter({type: "confiture"})
                            .cloneDeep()
                            .value()
const get_confiseries  = () =>  db.get("products")
                                .filter({type: "confiserie"})
                                .cloneDeep()
                                .value()
                              
app.get("/", (req, res) => {
    res.render("index", {
        confitures: get_confitures(),
        confiseries: get_confiseries()
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
    
    const db_email = db.get("users")
                        .find({email: email})
                        .get("email")
                        .value()
    const db_password = db.get("users")
                        .find({password: password})
                        .get("password")
                        .value()
    if (db_email == email && db_password == password) {
        req.session.loggedIn = true
        req.session.email = email
        req.session.password = password
        req.session.status = db.get("users")
                                .find({email: email})
                                .get("status")
                                .cloneDeep()
                                .value()
        res.redirect("/")
    } else {
        error_msg = "Incorrect Email and/or Password"
        res.render("log/sign-in", {
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
        const new_user = {email: email, password: password, status: "customer"}
        add_user(new_user)
        
        // redirect + msg in session 
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
    const activity = db.get("products")
                        .find({id: id})
                        .get("active")
                        .cloneDeep()
                        .value()
    
    db.get("products")
        .find({id: id})
        .set("active", !activity)
        .write()
    res.redirect("/stock")
})

app.post("/delete", (req, res) => {
    const id = req.body.id
    const product_type = req.body.product_type
    db.get("products")
        .remove({id: id})
        .write()
    res.redirect("/stock")
})

app.get("/stock", (req, res) => {
    res.render("admin/stock", {
        confitures: get_confitures(),
        confiseries: get_confiseries()
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
        const produit = db.get("products")
                            .find({id: req.query.id})
                            .value()
        res.render("confitures/produit", {
            confiture: produit
        })
    } else {
        res.render("confitures/index", {
            confitures: get_confitures()
        })
    }
})

app.get("/confiserie", (req, res) => {
    if (req.query.id) {
        const produit = db.get("products")
                            .find({id: req.query.id})
                            .value()
        res.render("confiseries/produit", {
            confiserie: produit
        })
    } else {
        res.render("confiseries/index", {
            confiseries: get_confiseries()
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
app.listen(port, () => {
    console.log("App started on port=> ", port)
})