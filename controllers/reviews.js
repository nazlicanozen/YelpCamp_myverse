const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.newReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Review sent!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.renderEditReview = async(req, res) => {
    const { id, reviewId } = req.params;

    // Find the campground and review
    const campground = await Campground.findById(id);
    const review = await Review.findById(reviewId);

    res.render('reviews/edit', { campground, review });
}

module.exports.editReview = async(req, res) => {

    const { id, reviewId } = req.params;
  
    // Find the review to update
    const review = await Review.findByIdAndUpdate(reviewId, req.body.review);

    // Redirect back to the campground page
    req.flash('success', 'Review updated successfully!');
    res.redirect(`/campgrounds/${id}`);

}
