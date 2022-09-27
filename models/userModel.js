const jwt = require("jsonwebtoken")


function userModel(req, res) {
    ///// On récupére le header 
    const headers = req.header("Authorization")
    ///// Si on ne récupére pas de token => Erreur 403
    if (headers == null) return res.status(403).send({ message: "Invalide" })
    /// On utilise split pour avoir uniquement le token
    const token = headers.split(" ")[1]
    if (token == null) return res.status(403).send({ message: "Invalide" })
    ////// On vérifie le token avec JWT et on le décode avec notre fonction
    jwt.verify(token, process.env.DB_JWT, (err, decoded) => decodeToken(err, decoded, res))   
}


/// Fonction qui décode le token, en cas de réussite affichage du array
function decodeToken(err, decoded, res) {
    if (err) res.status(401).send({ message: " Token non validé " + err })
    else {
        /// On affiche un array des sauces lors de la connexion
         Product.find({}).then(products => res.send(products)).catch(error => res.status(500).send(error))
}
}

module.exports= {userModel}