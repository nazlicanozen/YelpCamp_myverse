const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}

module.exports.renderRewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.image = req.files.map(eachFile => ({url: eachFile.path, filename: eachFile.filename}));
    campground.author = req.user._id;
    await campground.save();

    //console.log(campground);

    req.flash('success', 'New campground is saved successfully');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}

module.exports.editCampground = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;

    //console.log(req.body);

    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(eachFile => ({url: eachFile.path, filename: eachFile.filename}));
    campground.image.push(...imgs);
    await campground.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            try {
                await cloudinary.uploader.destroy(filename);
                console.log(`Deleted image with filename: ${filename}`);
            } catch (error) {
                console.error(`Error deleting image with filename ${filename}: ${error}`);
            }
        }
        
        await campground.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })
    }

    req.flash('success', 'Campground updated successfully');
    //console.log('Delete Images:', req.body.deleteImages);
    //console.log('Updated Campground:', campground);
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted');
    res.redirect('/campgrounds');
}
