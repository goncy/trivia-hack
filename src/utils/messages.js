const chalk = require("chalk")

const showError = message => console.log(chalk.red(message))
const showFinishMessage = () => console.log(chalk.green("Terminó la partida!"))

module.exports = {
  showError,
  showFinishMessage
}
