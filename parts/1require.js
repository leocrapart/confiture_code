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
