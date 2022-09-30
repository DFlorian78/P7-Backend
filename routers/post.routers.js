const express = require('express')
const { getPosts, createPost, createComment, deletePost, likePost, updatePost } = require('../controllers/posts')
const { checkToken} = require('../middleware/token')
const { imagesUpload} = require('../middleware/images')
const postRouter = express.Router()


postRouter.use(checkToken)
postRouter.post("/:id", createComment)
postRouter.get("/", getPosts)
postRouter.post("/", imagesUpload, createPost)
postRouter.put("/:id", imagesUpload, updatePost)
postRouter.delete("/:id", deletePost)
postRouter.post("/:id/like", likePost)
//postRouter.put("/:id", upload.single("image"), modifyPost)

module.exports = { postRouter }