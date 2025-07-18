const express = require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js")
const Listing = require('../models/listing.js')
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js")
const listingController = require("../controllers/listings.js")
const  multer = require('multer');
const {storage} = require('../cloudConfig.js'); 
const upload = multer({storage});


router
.route("/")
.get(wrapAsync(listingController.index)) //index route
//passing validateListing as a middleware
.post(isLoggedIn,
 upload.single('listing[image]'),
  validateListing,
 wrapAsync(listingController.createListing)); //create route


//New route:
//get req on: listings/new => form => submit post req goes on "/listings" 
router.get("/new", isLoggedIn, listingController.renderNewForm);


router
.route("/:id")
//show route: 
//get req on "/listings/:id" => show route , specific listing data(view) 
.get(wrapAsync(listingController.showListing))
//update route:
//put request on "/listings/:id"
.put(isLoggedIn, isOwner,
 upload.single('listing[image]'),
 validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)); //delete route


//edit route:
//get req on "/listings/:id/edit"
router.get("/:id/edit", isLoggedIn, isOwner,  wrapAsync(listingController.renderEditForm));

module.exports = router;