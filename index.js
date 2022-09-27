require('dotenv').config()
const express = require('express')
const app = express()
const {authRouter} = require("./routers/auth.routers")
const port = process.env.PORT || 3000
const bodyParser = require("body-parser")
const cors = require("cors")
const { req, res } = require('express')
const { loginUser, signupUser } = require('./controllers/user')
const { postRouter } = require("./routers/post.routers")
const { prisma } = require("./db/db")



app.use(cors())
  
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extendre: true}))

app.use("/posts", postRouter)
app.use("/uploads", express.static("uploads"))

app.post("/auth/login", loginUser)
app.post("/auth/signup", signupUser)

/// On demande à l'app d'écouter sur le port 3000 et de renvoyer le message
app.listen(port, () => console.log('Listening on port' + port))