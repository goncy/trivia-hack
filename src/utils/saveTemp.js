const fs = require("fs")

const saveTemp = (data, name, notify = false) => {
  if (!fs.existsSync("./temp")) fs.mkdirSync("./temp")
  fs.writeFile(`./temp/${name}.json`, data, err => {
    if (err) return console.log(err)
    if (notify) console.log(`${name} file was saved!`)
  })
}

module.exports = { saveTemp }
