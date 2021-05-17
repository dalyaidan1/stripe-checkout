const express = require("express")
const app = express() // express saves all the manual setup from a basic node server

app.set("view engine", "ejs") // allow embedding server side code to html
app.use(express.static("public")) // all file in public are static, and available on front-end

app.listen(3000)