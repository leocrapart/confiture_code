var shell = require("shelljs")

const command1 = "node concat.js"
const command2 = "node main.js"

let super_command = `${command1} && ${command2}`


if (shell.exec(super_command).code !== 0) {
  shell.echo('Error: process failed');
  shell.exit(1);
}