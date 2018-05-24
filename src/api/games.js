const request = require("request-promise")
const chalk = require("chalk")
const R = require("ramda")

const { saveTemp } = require("../utils/saveTemp")

const getGameURL = (userId, gameId) =>
  `https://api.preguntados.com/api/users/${userId}/games/${gameId}`

const getSubmitAnswerURL = (userId, gameId) =>
  getGameURL(userId, gameId) + "/answers"

const getGame = ({ userId, session }) => ({ gameId }) =>
  request({
    url: getGameURL(userId, gameId),
    method: "GET",
    headers: {
      "Eter-Session": session
    }
  })

const submitAnswer = ({ userId, session, gameId, answer }) =>
  request({
    url: getSubmitAnswerURL(userId, gameId),
    method: "POST",
    json: true,
    body: answer,
    headers: {
      "Eter-Session": session
    }
  })

const getAnswer = response =>
  new Promise((resolve, reject) => {
    try {
      const data = JSON.parse(response)
      const question = R.path(["spins_data", "spins", "0"], data)
      const answer = R.path(["questions", "0", "question"], question)

      const filteredAnswer = {
        id: data.id,
        info: {
          question: answer.text,
          category: answer.category,
          answer: answer.answers[answer.correct_answer]
        },
        data: {
          type: question.type,
          answers: [
            {
              answer: answer.correct_answer,
              category: answer.category,
              id: answer.id
            }
          ]
        }
      }
      resolve(filteredAnswer)
    } catch (e) {
      saveTemp(response, "getAnswer")
      reject(
        new Error(
          "Hubo un error al obtener una pregunta, posiblemente es por que el contrincante todavia no esta definido (smartplay) y no se pueden ganar mas de 3 coronas juntas en esta instancia"
        )
      )
    }
  })

const printText = (prop, value) => {
  switch (prop) {
    case "type":
      if (value === "NORMAL") return chalk.black.bgWhite(value)
      if (value === "CROWN") return chalk.black.bgYellow(value)
      break
    case "category":
      if (value === "SCIENCE") return chalk.black.bgHex("#1BBF61")(value)
      if (value === "HISTORY") return chalk.black.bgHex("#F0E90C")(value)
      if (value === "SPORTS") return chalk.black.bgHex("#F16D00")(value)
      if (value === "GEOGRAPHY") return chalk.black.bgHex("#1E7CD3")(value)
      if (value === "ENTERTAINMENT") return chalk.black.bgHex("#F112E0")(value)
      if (value === "ARTS") return chalk.black.bgHex("#F12832")(value)
      break
    case "question":
      return chalk.bold(value)
    case "answer":
      return chalk.bold(value)
    default:
      return value
  }
}

const winGame = ({ userId, session }) => game =>
  getAnswer(game)
    .then(answer => {
      console.log(`
      Contestando una pregunta de tipo ${printText("type", answer.data.type)},
      de la categoria ${printText("category", answer.info.category)},
      la pregunta es "${printText("question", answer.info.question)}"
      y la respuesta es "${printText("answer", answer.info.answer)}"
      `)

      return answer
    })
    .then(answer =>
      submitAnswer({
        userId,
        session,
        gameId: answer.id,
        answer: answer.data
      })
    )
    .then(game => {
      if (game.game_status !== "ENDED") {
        return winGame({ userId, session })(JSON.stringify(game))
      }
    })

module.exports = {
  getGameURL,
  getSubmitAnswerURL,
  getGame,
  submitAnswer,
  getAnswer,
  printText,
  winGame
}
