const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground, validateImageUpload } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground');


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateImageUpload, validateCampground,  catchAsync(campgrounds.createCampground));


router.get('/new', isLoggedIn, campgrounds.renderRewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image', 10), validateImageUpload, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampground));


module.exports = router;
