const request = require("request-promise")
const R = require("ramda")

const getDashboardURL = userId =>
  `https://api.preguntados.com/api/users/${userId}/dashboard`

const getDashboard = ({ userId, session }) =>
  request({
    url: getDashboardURL(userId),
    headers: {
      "Eter-Session": session
    }
  })

const getMatches = response => {
  return new Promise((resolve, reject) => {
    try {
      const data = JSON.parse(response)
      const activeMatches = R.pipe(
        R.prop("list"),
        R.reject(R.propEq("game_status", "ENDED")),
        R.reject(R.propEq("my_turn", false))
      )(data)

      const filteredMatches = R.map(
        match => ({
          ...R.pick(["id", "game_status"], match),
          opponent: R.pick(["id", "username", "facebook_name"], match.opponent)
        }),
        activeMatches
      )

      resolve(filteredMatches)
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  getDashboard,
  getMatches
}
