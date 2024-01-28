const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
    req.session.returnTo = req.originalUrl
    if(!req.isAuthenticated()){
        req.flash('error', 'You need to be logged in!');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateImageUpload = (req, res, next) => {
    const uploadedFiles = req.files;
  
    console.log('Uploaded Files:', uploadedFiles);
  
    if (!uploadedFiles || uploadedFiles.length > 10) {
      // Set the flash error message
      req.flash('error', 'You can only upload up to 10 images.');
      // Redirect to a page where the flash message can be displayed
      return res.redirect(`/campgrounds`);
    }
    // Proceed to the next middleware or route handler
    next();
};
  
  

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id); 
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'Access denied!');
        return res.redirect(`/campgrounds/${campground._id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    const rating = req.body['review[rating]'];

    // Check if the rating is '0' (No rating)
    if (rating === '0') {
        req.flash('error', 'Please select a star rating before submitting your review.');
        return res.redirect(req.get('referer')); // Redirect back to the referring page
    }

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};


module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'Access denied!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
