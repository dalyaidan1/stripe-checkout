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
const Stripe = require("stripe");
const stripe = Stripe(stripeSecretKey);

app.set("view engine", "ejs") // allow embedding server side code to html
app.use(express.static("public")) // all file in public are static, and available on front-end

// used to parse the body of a requests
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({extended: true}))

if (process.env.NODE_ENV !== "production") {
// Add headers to enable bypass for CORS POLICY
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:30000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
}

// route for clicking the store page
app.get("/store", (req, res) =>{
    fs.readFile("items.json", (error, data) => {
        if (error) {
            res.status(500).end()
        } else {
            res.render("store.ejs",
            {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data) // pass the data (items.json) along with store
            })
        }
    })
})

// route for clicking the purchase button on store page
app.post("/create-checkout-session", async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price:"price_1IsFq7KI9xDxhPPdiBPA1XVp",
            quantity: req.body.quantity,
        }],
        mode: 'payment',
        success_url: 'http://localhost:3000?id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/cancel',
      });
      res.json({
          id: session.id,
      })
})

app.listen(3000)