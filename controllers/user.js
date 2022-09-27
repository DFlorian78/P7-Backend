const jwt = require("jsonwebtoken")
const { users } = require ("../db/db.js")
const bcrypt = require("bcrypt")
/// On initalise notre base de données
const { PrismaClient } = require ('@prisma/client')
const prisma = new PrismaClient()


async function loginUser(req, res) {
    const {email, password} = req.body
    try {
    const user = await getUser(email)
    if (user == null) return res.status(404).send({error: "User not found"})

    const isPasswordCorrect = await checkPasswordOk(user, password)
    if (!isPasswordCorrect) return res.status(401).send({ error: "Mot de passe incorrect" })

    const token = makeToken(user.id)
    res.send({ token:token, id :user.id, is_admin :user.is_admin, email :user.email })
    } catch (error) {
     res.status(500).send({ error })
}
}

function makeToken(id) {
    return jwt.sign({ id },process.env.DB_JWT, { expiresIn: "24h" })
}
function getUser (email) {
    return prisma.user.findUnique({ where: { email } })
}

function checkPasswordOk(user, password) {
    return bcrypt.compare(password, user.password)
}   

async function signupUser(req, res) {
const { email, password, confirmPassword } = req.body
console.log("req.body:", req.body)
try {
if (confirmPassword == null) 
return res.status(400).send({ error : " Merci de confirmer votre mot de passe" })
if (password !== confirmPassword) 
return res.status(400).send({ error: "Mot de passe incorrect" })
const userInDb = await getUser(email)
if (userInDb != null) return res.status(400).send({ error: "L'utilisateur est déjà enregistrer" })

const hash = await hashPassword(password)
const user = await saveUser ({ email, password: hash})
res.send ({ user })
} catch (error) {
    res.status(500).send ({ error })
}
}

function saveUser(user) {
    return prisma.user.create({ data: user})
}

function hashPassword(password) {
    const NUMBER_OF_SALT_ROUNDS=10
    return bcrypt.hash(password, NUMBER_OF_SALT_ROUNDS)
}
module.exports = { loginUser, signupUser }