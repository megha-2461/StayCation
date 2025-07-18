const express = require("express");
const router = express.Router({mergeParams: true}); //to access id from listings/id/reviews while adding reviews
const wrapAsync=require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js");
const Review = require('../models/review.js')
const Listing = require('../models/listing.js')
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")
const reviewController = require("../controllers/reviews.js");


//review post route:
//post route
//we want to access reviews for that particular listing , therfore new route not created
router.post("/", isLoggedIn,validateReview, wrapAsync(reviewController.createReview));


//delete review route:
router.delete("/:reviewId" , isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview))

module.exports = router;
