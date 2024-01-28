const express = require('express');
const router = express.Router({mergeParams: true}); //for accesing the campground id

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const Campground = require('../models/campground');
const {campgroundSchema, reviewSchema} = require('../schemas.js');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');

router.post('/', validateReview, isLoggedIn, catchAsync(reviews.newReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));


//******MY CODE*****
router.get('/:reviewId/edit', isLoggedIn, isReviewAuthor, reviews.renderEditReview)

router.put('/:reviewId', isLoggedIn, isReviewAuthor, validateReview, reviews.editReview);


module.exports = router;