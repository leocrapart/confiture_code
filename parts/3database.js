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

    
