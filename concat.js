const concat = require("concat")

const file1 = "./parts/1require.js"
const file2 = "./parts/2session.js"
const file3 = "./parts/3database.js"
const file4 = "./parts/4router.js"

const files_to_concat = [file1, file2, file3, file4]
const output_file = "main.js"

concat(files_to_concat,output_file)