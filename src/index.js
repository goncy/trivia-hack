#!/usr/bin/env node
const program = require("commander")
const inquirer = require("inquirer")

const { getDashboard, getMatches } = require("./api/dashboard")
const { getGame, winGame } = require("./api/games")
const { showError, showFinishMessage } = require("./utils/messages")

let userId
let session

const buildQuestions = matches => {
  if (!matches.length) {
    throw new Error("No hay partidas activas!")
  }

  return [
    {
      type: "list",
      name: "gameId",
      message: "A quien le queres ganar?",
      choices: matches.map(({ id, opponent }) => ({
        name: opponent.facebook_name || opponent.username,
        value: id
      }))
    }
  ]
}

program
  .version("0.1.0")
  .arguments("<user-id> <session>")
  .action((inputUserId, inputSession) => {
    userId = inputUserId
    session = inputSession
  })
  .parse(process.argv)

getDashboard({ userId, session })
  .then(getMatches)
  .then(buildQuestions)
  .then(inquirer.prompt)
  .then(getGame({ userId, session }))
  .then(winGame({ userId, session }))
  .then(showFinishMessage)
  .catch(showError)
