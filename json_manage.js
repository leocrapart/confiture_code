const edit_json = require("edit-json-file")


let file = edit_json(`${__dirname}/foo.json`)
file.set("planet", "earth")
file.set("city\\.name", "anytown");
file.set("name.first", "Johnny");
file.set("name.last", "B.");
file.set("is_student", false);

console.log(file.get())

file.save()

file = edit_json(`${__dirname}/foo.json`, {
    autosave: true
})

console.log(file.get("name.first"))

file.set("a.new.field.as.object", {
    hello: "world"
})

console.log(file.toObject())

file.set("planet", "mars")
