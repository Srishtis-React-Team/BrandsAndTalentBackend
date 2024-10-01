
var express = require('express');
var router = express.Router();


const blog = require('../controllers/blog')
router.post('/addBlog',blog.addBlog)//for addBlog
router.post('/fetchBlogByType',blog.fetchBlogByType)//for fetchBlogByType
router.post('/deleteBlog',blog.deleteBlog)//for deleteBlog
router.post('/editBlog',blog.editBlog)//for editBlog
router.get('/getFeaturedArticles',blog.getFeaturedArticles)//for deleteCogetFeaturedArticlesntent




module.exports = router






