require('dotenv').config();
const express = require('express')
const ejs = require('ejs')
const app = express()
const mongoose = require('mongoose')

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const PORT = process.env.PORT || 3000
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set("view engine", "ejs")
app.use(express.static("public"))
app.listen(PORT, () => console.log('Server up'))

//mongoose DB connection
const connectDB = async() => {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB Connected")
}
connectDB()

const userSchema = new mongoose.Schema({
    users: Number,
})

const User = mongoose.model("User", userSchema)

app.get('/', (req, res) => {
    res.render("home")
})

app.post('/', (req, res) => {
    const number = req.body.number
    let randomTwilio = Math.floor(Math.random() * 90000) + 10000

    const saveUser = () => {
        const newUser = new User({
            users: randomTwilio
        })
        newUser.save((err) => {
            if (err) console.log('error generating number')
            else res.render('verify')
        })
    }

    client.messages
      .create({body: randomTwilio, from: '+14303040956', to: number})
      .then(saveUser());
})

app.get('/verify', (req, res) => {
    res.render("verify")
})

app.post('/verify', (req, res) => {
    const code = req.body.code
    User.findOne({ users: code }, (err, found) => {
        if (err) res.render('error')
        else if (found) res.render('success')
        else res.render('error')
    })
})