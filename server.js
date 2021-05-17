// because we only included dotenv lib for dev it wont exist in production so check the NODE_ENV (set by node) if we are in production to avoid errors
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config() // use the env
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

// console.log(stripeSecretKey, stripePublicKey)

const express = require("express")
const app = express() // express saves all the manual setup from a basic node server
const fs = require("fs") // read different files

app.set("view engine", "ejs") // allow embedding server side code to html
app.use(express.static("public")) // all file in public are static, and available on front-end

// route for clicking the store page
app.get("/store", (req, res) =>{
    fs.readFile("items.json", (error, data) => {
        if (error) {
            res.status(500).end()
        } else {
            res.render("store.ejs",
            {
                items: JSON.parse(data) // pass the data (items.json) along with store
            })
        }
    })
})

app.listen(3000)