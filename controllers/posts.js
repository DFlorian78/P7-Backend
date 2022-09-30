const { prisma } = require("../db/db")

async function getPosts(req, res) {
    const posts = await prisma.post.findMany({
        include: {
            comments: {
                include: {
                    user: {
                        select: {
                            email: true
                        }
                    }
                }
            },
            user: {
                select: {
                    email: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })
    res.send({ posts })
}

async function createPost(req, res) {
    const content = req.body.content

    try {
        const userId = req.authId
        const post = { content, userId, usersliked: '', usersdisliked: '' }
        addImagePost(req, post)

        const resolve = await prisma.post.create({ data: post })
        console.log("resolve:", resolve)
        res.send({ post: resolve })
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Une erreur est survenue" })
    }
}

function addImagePost(req, post) {
    const hasImage = req.file != null
    if (!hasImage) return
    let pathToImage = req.file.path.replace("\\", "/")
    /// Ici on génere l'adresse ou se charge la photo (ici localhost:3000)
    const protocol = req.protocol
    const host = req.get("host")
    const url = `${protocol}://${host}/${pathToImage}`
    post.imageUrl = url
}




/// Fonction pour supprimer nos posts
async function deletePost(req, res) {
    const postId = Number(req.params.id)
    try {
        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        })
        if (post == null) {
            return res.status(404).send({ error: " Post was not found" })
        }

        if (req.authId !== post.userId || currentUser.is_admin==1) {
            return res.status(404).send({ error: "Vous n'êtes pas l'auteur de ce post" })
        }
        // Ici on supprime les commenaires liés au post
        await prisma.comment.deleteMany({ where: { postId } })
        await prisma.post.delete({ where: { id: postId } })
        res.send({ message: "Post supprimer" })
    } catch (err) {
        res.status(500).send({ error: "Something went wrong" })
    }
}

 //// MODIFICATIONS DES POSTS ///
 async function updatePost(req, res) {
    let post = await prisma.post.findUnique({
        where: {
            id: parseInt(req.params.id)
        }
    });
    
    addImagePost(req, post)

    post = await prisma.post.update({
        data: {
            content:req.body.content,
        },
        where: {
            id: post.id
        }

    })

    return res.send({ post })

   }


////// On met en place les likes
async function likePost(req, res) {
    const like = req.body.like
    const userId = req.authId
    /// On utilise includes pour le nombre de likes
    if (![1, -1, 0].includes(like))
        return res.status(403).send({ message: "mauvaise requête" })

    let post = await prisma.post.findUnique({
        where: {
            id: parseInt(req.params.id)
        }
    });


    post = voteUpdate(post, like, userId.toString());

    post = await prisma.post.update({
        data: {
            usersliked: post.usersliked,
            usersdisliked: post.usersdisliked
        },
        where: {
            id: post.id
        }

    })

    return res.send({ post })
}

/////// FONCTION POUR LIKES OU DISLIKES
function voteUpdate(post, like, userId) {
    if (like === 1 || like === -1)
        return voteLike(post, userId, like)
    return resetVote(post, userId)
}

//// On remet à 0 les likes/dislikes
function resetVote(post, userId) {
    let { usersliked, usersdisliked } = post

    // vue que mes likes et dislikes sont des chaines en BD, je les transforme en tableau
    usersliked = usersliked.split(',');
    usersdisliked = usersdisliked.split(',');

    //// On gères nos cas d'erreurs ici
    //// On utilise Every pour vérifier les valeurs de l'userId dans notre array
    if ([usersliked, usersdisliked].every((arr) => arr.includes(userId)))
        return Promise.reject("L'utilisateur à déjà voter")
    //// On utilise Some pour faire le contraire de Every
    /*if (![usersliked, usersdisliked].some((arr) => arr.includes(userId)))
        return Promise.reject("L'utilisateur n'a pas voter")*/

    ///// On utilise filter pour renvoyer une array des différents userId
    if (usersliked.includes(userId)) {
        const filteruserliked = usersliked.filter(id => id !== userId);
        post.usersliked = filteruserliked.join()
    } else {
        const filterusersdisliked = usersdisliked.filter(id => id !== userId);
        post.usersdisliked = filterusersdisliked.join()
    }
    return post
}

//// ON REGROUPE LES LIKES ET DISLIKES DANS UNE MEME FONCTION ET ON EN FAIT UNE ARRAY
function voteLike(post, userId, like) {
    let { usersliked, usersdisliked } = post

    // vue que mes likes et dislikes sont des chaines en BD, je les transforme en tableau
    usersliked = usersliked.split(',');
    usersdisliked = usersdisliked.split(',');

    const arrayVote = like === 1 ? usersliked : usersdisliked
    if (arrayVote.includes(userId))
        return post
    arrayVote.push(userId)

    //like === 1 ? ++post.likes : ++post.dislikes
    if (like === 1) {
        post.usersliked = arrayVote.join(',')
    } else {
        post.usersdisliked = arrayVote.join(',')
    }
    return post
}
//// Fonction pour valider ou non nos mises à jour produits 
function clientResponse(post, res) {
    if (post == null) {
        console.log("Rien à mettre à jour")
        return res.status(404).send({ message: "Le produit n'es pas dans la base de donnée" })
    }
    console.log("Le produit à été mis à jour", post)
    return Promise.resolve(res.status(200).send(post)).then(() => post)
}


/// Fonction async pour créer nos commentaires avec Prisma
async function createComment(req, res) {
    /// On force le req.params à nous rendre un nombre pour notre Id
    const postId = Number(req.params.id)
    const post = await prisma.post.findUnique({
        where: { id: postId }
    })
    if (post == null) {
        return res.status(404).send({ error: "Post was not found" })
    }

    /// On récupère nos données d'envoie
    const commentToSend = { userId: Number(req.authId), postId, content: req.body.comment }
    const comment = await prisma.comment.create({ data: commentToSend })
    res.send({ comment })
}

module.exports = { getPosts, createPost, createComment, deletePost, likePost, updatePost }