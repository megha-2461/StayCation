const express = require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js")
const Listing = require('../models/listing.js')


//error in middleware form
const validateListing = (req, res, next)=>{
 let {error} = listingSchema.validate(req.body);
    // console.log(result);
    if (error){ //JOI's error
      let errMsg = error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else{ 
      next();
    }

}

//index route:
router.get("/", wrapAsync(async (req, res)=>{
   const allListings = await Listing.find({});
   res.render("listings/index.ejs", {allListings}); //views folder no need to include in path,handled
}));

//New route:
//get req on: listings/new => form => submit post req goes on "/listings" 
router.get("/new", (req, res)=>{
    res.render("listings/new.ejs");
})

//show route: 
//get req on "/listings/:id" => show route , specific listing data(view) 
router.get("/:id",  wrapAsync(async (req, res)=>{
let {id}=req.params;
const listing = await Listing.findById(id).populate("reviews");

res.render("listings/show.ejs", {listing});
}));

//create route:
//passing validateListing as a middleware
router.post("/", validateListing,
  wrapAsync(async (req, res, next)=>{
   const newListing = new Listing(req.body.listing);
   await newListing.save()
    res.redirect("/listings");
    
}))


//edit route:
//get req on "/listings/:id/edit"
router.get("/:id/edit",  wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", {listing});
}));

//update route:
//put request on "/listings/:id"
router.put("/:id",  validateListing,
  wrapAsync(async (req, res) => {
  // if (!req.body.listing){
  //     throw new ExpressError(404, "Sent valid data for listing")
  //   }
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing});
  res.redirect(`/listings/${id}`);
}));

//delete route:
router.delete("/:id",  wrapAsync(async (req, res)=>{
  let {id}=req.params;
  let deletedListing = await Listing.findByIdAndDelete(id); //this will call post M.W. in listing.js inside models folder
  console.log(deletedListing);
  res.redirect("/listings"); 
}));

module.exports = router;