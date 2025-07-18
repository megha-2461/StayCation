const Listing = require("../models/listing");

// module.exports.index = async (req, res)=>{
//    const allListings = await Listing.find({});
//    res.render("listings/index.ejs", {allListings}); //views folder no need to include in path,handled
// };


module.exports.index = async (req, res) => {
  try {
    const { category, q } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { country: { $regex: q, $options: 'i' } }
      ];
    }

    const listings = await Listing.find(query);
    res.render("listings/index", { listings, category });
  } catch (e) {
    console.log(e);
    req.flash("error", "Cannot load listings at the moment");
    res.redirect("/");
  }
};


// module.exports.index = async (req, res) => {
//  try {
//     const { category } = req.query;
//     let listings;

//     if (category) {
//       listings = await Listing.find({ category });
//     } else {
//       listings = await Listing.find({});
//     }

//     res.render("listings/index", { listings, category });
//   } catch (e) {
//     console.log(e);
//     req.flash("error", "Cannot load listings at the moment");
//     res.redirect("/");
//   }
// };


module.exports.renderNewForm = (req, res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res)=>{
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
}


module.exports.createListing = async (req, res, next)=>{
   try {
    const address = req.body.listing.location;
    // Fetch coordinates using Nominatim
    const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
      headers: {
        'User-Agent': 'StayCation/1.0'
      }
    });

    const geoData = await geoResponse.json();
     let coordinates = [0, 0]; 
    if (geoData.length > 0) {
      coordinates = [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)];
    }

    let url = req.file.path;
    let filename = req.file.filename;
   const newListing = new Listing(req.body.listing);
   newListing.owner = req.user._id;
   newListing.image={url, filename};
   newListing.geometry = {type: "Point", coordinates: coordinates}
   let savedListing = await newListing.save()
   console.log(savedListing);
   req.flash("success", "New Listing created!")
    res.redirect("/listings");
    
   } catch (err) {
    console.error("Error during geocoding or listing creation:", err);
    req.flash("error", "Something went wrong.");
    res.redirect("/listings/new");
  }
  };

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing){
  req.flash("error", "Listing you requested for do not exist")
  res.redirect("/listings");
}
// else
  else{
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace('/upload', "/upload/w_250");
  res.render("listings/edit.ejs", {listing, originalImageUrl});
  }
};

module.exports.updateListing = async (req, res) => {
  // if (!req.body.listing){
  //     throw new ExpressError(404, "Sent valid data for listing")
  //   }
  let {id} = req.params;
  let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
  if (typeof req.file !== "undefined"){
  let url = req.file.path;
  let filename = req.file.filename;
  listing.image = {url, filename};
    await listing.save();
  }
  req.flash("success", "Listing updated");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res)=>{
  let {id}=req.params;
  let deletedListing = await Listing.findByIdAndDelete(id); //this will call post M.W. in listing.js inside models folder
  console.log(deletedListing);
  req.flash("success", "Listing deleted");
  res.redirect("/listings"); 
}