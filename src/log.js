const chalk = require("chalk");

const warn = (message) => {
  console.log(chalk.yellow(message))
}

const error = (message) => {
  console.log(chalk.red(message))
}

const log = (message) => {
  console.log(message)
}

module.exports = {
  warn,
  error,
  log,
}
