const express = require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js")
const Listing = require('../models/listing.js')
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js")




//index route:
router.get("/", wrapAsync(async (req, res)=>{
   const allListings = await Listing.find({});
   res.render("listings/index.ejs", {allListings}); //views folder no need to include in path,handled
}));

//New route:
//get req on: listings/new => form => submit post req goes on "/listings" 
router.get("/new", isLoggedIn, (req, res)=>{
    res.render("listings/new.ejs");
})

//show route: 
//get req on "/listings/:id" => show route , specific listing data(view) 
router.get("/:id",  wrapAsync(async (req, res)=>{
let {id}=req.params;
const listing = await Listing.findById(id)
.populate({
  path: "reviews", 
  populate: {
    path: "author"
  }
})
.populate("owner"); 
if (!listing){
  req.flash("error", "Listing you requested for do not exist")
  return res.redirect("/listings");
}
console.log(listing);
res.render("listings/show.ejs", {listing});
}));

//create route:
//passing validateListing as a middleware
router.post("/", isLoggedIn, validateListing,
  wrapAsync(async (req, res, next)=>{
   const newListing = new Listing(req.body.listing);
   newListing.owner = req.user._id;
   await newListing.save()
   req.flash("success", "New Listing created!")
    res.redirect("/listings");
    
}))


//edit route:
//get req on "/listings/:id/edit"
router.get("/:id/edit", isLoggedIn, isOwner,  wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing){
  req.flash("error", "Listing you requested for do not exist")
  res.redirect("/listings");
}
else
  res.render("listings/edit.ejs", {listing});
}));

//update route:
//put request on "/listings/:id"
router.put("/:id", isLoggedIn, isOwner, validateListing,
  wrapAsync(async (req, res) => {
  // if (!req.body.listing){
  //     throw new ExpressError(404, "Sent valid data for listing")
  //   }
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing});
  req.flash("success", "Listing updated");
  res.redirect(`/listings/${id}`);
}));

//delete route:
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res)=>{
  let {id}=req.params;
  let deletedListing = await Listing.findByIdAndDelete(id); //this will call post M.W. in listing.js inside models folder
  console.log(deletedListing);
  req.flash("success", "Listing deleted");
  res.redirect("/listings"); 
}));

module.exports = router;