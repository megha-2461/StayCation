const express = require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js")
const Listing = require('../models/listing.js')
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js")

const listingController = require("../controllers/listings.js")


//index route:
router.get("/", wrapAsync(listingController.index));

//New route:
//get req on: listings/new => form => submit post req goes on "/listings" 
router.get("/new", isLoggedIn, listingController.renderNewForm);

//show route: 
//get req on "/listings/:id" => show route , specific listing data(view) 
router.get("/:id",  wrapAsync(listingController.showListing));


//create route:
//passing validateListing as a middleware
router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));


//edit route:
//get req on "/listings/:id/edit"
router.get("/:id/edit", isLoggedIn, isOwner,  wrapAsync(listingController.renderEditForm));


//update route:
//put request on "/listings/:id"
router.put("/:id", isLoggedIn, isOwner, validateListing,
  wrapAsync(listingController.updateListing));


//delete route:
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;