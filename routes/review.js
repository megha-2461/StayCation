const express = require("express");
const router = express.Router({mergeParams: true}); //to access id from listings/id/reviews while adding reviews
const wrapAsync=require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js");
const Review = require('../models/review.js')
const Listing = require('../models/listing.js')
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")



//review post route:
//post route
//we want to access reviews for that particular listing , therfore new route not created
router.post("/", isLoggedIn,validateReview, wrapAsync(async(req, res)=>{
let listing = await Listing.findById(req.params.id);
let newReview = new Review(req.body.review);
newReview.author = req.user._id;
console.log(newReview);
listing.reviews.push(newReview);

await newReview.save();
await listing.save();
  // console.log(deletedListing);
req.flash("success", "New review created");
res.redirect(`/listings/${listing._id}`);

// console.log("new review saved");
// res.send("new review saved");
}));

//delete review route:
router.delete("/:reviewId" , isLoggedIn, isReviewAuthor, wrapAsync(async(req, res)=>{
  let {id, reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
    // console.log(deletedListing);
  req.flash("success", "Review deleted");
  res.redirect(`/listings/${id}`);
}))

module.exports = router;
