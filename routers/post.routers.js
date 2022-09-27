const express = require('express')
const { getPosts, createPost, createComment, deletePost, likePost } = require('../controllers/posts')
const { checkToken} = require('../middleware/token')
const { imagesUpload} = require('../middleware/images')
const postRouter = express.Router()


postRouter.use(checkToken)
postRouter.post("/:id", createComment)
postRouter.delete("/:id", deletePost)
postRouter.get("/", getPosts)
postRouter.post("/", imagesUpload, createPost)
postRouter.post("/:id/like", likePost)
//postRouter.put("/:id", upload.single("image"), modifyPost)

module.exports = { postRouter }