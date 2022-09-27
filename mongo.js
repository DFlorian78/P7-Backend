// BASE DE DONNEES
const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator")
/// On caches nos infos persos
const password = process.env.DB_PASSWORD
const username = process.env.DB_USER
//// Connexion à mongo
mongoose.connect(`mongodb+srv://${username}:${password}@groupomania.v0d3dge.mongodb.net/?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

/// Attente des schema mongo
const userSchema = new mongoose.Schema({
  ////On choisit d'enregistrer une seule unique adresse email avec Unique:true
  pseudonyme: { type: String, required:true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
})
userSchema.plugin(uniqueValidator)
const User = mongoose.model("User", userSchema)

module.exports = { mongoose, User } 