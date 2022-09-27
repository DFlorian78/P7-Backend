const jwt = require("jsonwebtoken")

//Function to verify user when login. Verify header and token.
function authenticateUser(req, res, next){
    const header = req.header("Authorization");
    if (header == null) return res.status(403).send({ message: "Invalid authorization header" });

    const token = header.split(" ")[1];// Selecting the token part of the headers
    if (token == null) return res.status(403).send({ message: "Token is required" });
    
    //Verifying the token with JWT before logging in. 
    jwt.verify(token, process.env.JWT_PASSWORD, (err) => {
        //Err will intercept bad tokens and expired tokens.
        if (err) return res.status(403).send({message : "Token invalid" + err});
        next();
    })
}
module.exports = {authenticateUser}