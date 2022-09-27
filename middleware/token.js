const jwt = require('jsonwebtoken')

function checkToken(req, res, next) {
    console.log("checkToken", checkToken)
    const token = req.headers.authorization.split(' ')[1];
    console.log("token:", token)
    if (token == null) return res.status(401).send({ error : "Missing token" })

    jwt.verify(token, process.env.DB_JWT, (error, decoded) => {
        console.log("decoded:", decoded)
        if (error) return res.status(401).send({ error : "Token invalid" })
        req.authId = decoded.id
        next()
})
}

module.exports = { checkToken }