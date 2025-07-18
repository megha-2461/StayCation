
const express=require('express');
const app=express();
const mongoose=require('mongoose');
const Listing = require('./models/listing.js')


//for using ejs , do following 3 steps:
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const methodOverride=require("method-override");

app.use(methodOverride('_method'));

const ejsMate=require('ejs-mate');
app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "/public"))); //to use css files or files in public folder

app.use(express.urlencoded({extended : true})) //to parse data

const wrapAsync=require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js")
const Review = require('./models/review.js')

const   MONGO_URL="mongodb://127.0.0.1:27017/staydb"
main()
.then(()=>{
console.log("connected to DB");
})
.catch((err)=>{
console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL)
}



//basic api:
app.get("/", (req, res)=>{
    res.send("i am root");
});
 
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

const validateReview = (req, res, next)=>{
 let {error} = reviewSchema.validate(req.body);
    if (error){ 
      let errMsg = error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else{ 
      next();
    }
}


//index route:
app.get("/listings", wrapAsync(async (req, res)=>{
   const allListings = await Listing.find({});
   res.render("listings/index.ejs", {allListings}); //views folder no need to include in path,handled
}));

//New route:
//get req on: listings/new => form => submit post req goes on "/listings" 
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs");
})

//show route: 
//get req on "/listings/:id" => show route , specific listing data(view) 
app.get("/listings/:id",  wrapAsync(async (req, res)=>{
let {id}=req.params;
const listing = await Listing.findById(id).populate("reviews");
res.render("listings/show.ejs", {listing});
}));

//create route:
//passing validateListing as a middleware
app.post("/listings", validateListing,
  wrapAsync(async (req, res, next)=>{
    //let {title, description, image, price, country, location}=req.body;
    //instead of writing this long syntax , we can create the form as object 
    // let listing = req.body.listing;
    /* if (!req.body.listing){
      throw new ExpressError(404, "Sent valid data for listing")
    }
  const newListing =  new Listing(req.body.listing)
  if (!newListing.title){
    throw new ExpressError(400, "Title is missing")
  }
  if (!newListing.description){
    throw new ExpressError(400, "Description is missing")
  }
  if (!newListing.location){
    throw new ExpressError(400, "Location is missing")
  } */

   
   await newListing.save()
    res.redirect("/listings");
    
}))


//edit route:
//get req on "/listings/:id/edit"
app.get("/listings/:id/edit",  wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", {listing});
}));

//update route:
//put request on "/listings/:id"
app.put("/listings/:id",  validateListing,
  wrapAsync(async (req, res) => {
  // if (!req.body.listing){
  //     throw new ExpressError(404, "Sent valid data for listing")
  //   }
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing});
  res.redirect(`/listings/${id}`);
}));

//delete route:
app.delete("/listings/:id",  wrapAsync(async (req, res)=>{
    let {id}=req.params;
  let deletedListing = await Listing.findByIdAndDelete(id); //this will call post M.W. in listing.js inside models folder
  console.log(deletedListing);
  res.redirect("/listings"); 
}));


//review post route:

//post route
//we want to access reviews for that particular listing , therfore new route not created
app.post("/listings/:id/reviews",validateReview, wrapAsync(async(req, res)=>{
let listing = await Listing.findById(req.params.id);
let newReview = new Review(req.body.review);
listing.reviews.push(newReview);
await newReview.save();
await listing.save();
res.redirect(`/listings/${listing._id}`);

// console.log("new review saved");
// res.send("new review saved");
}));

//delete review route:
app.delete("/listings/:id/reviews/:reviewId" , wrapAsync(async(req, res)=>{
  let {id, reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
}))

// app.get("/testListing",async (req, res)=>{
//  let sampleListing=new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1999,
//     location: "Goa",
//     country: "India"
//  });

// await sampleListing.save();
// console.log("sample saves");
// res.send("test successful");

// })

//if above err don't match then this will be executed for all
//app.all("*", ()) => server crashing
app.use((req, res, next)=>{
  next(new ExpressError(404, "Page not found"));
}) ;

//Error handling middleware for invalid validation for async errors
app.use((err, req, res, next)=>{
  let {statusCode=500, message="SOMETHING WENT WRONG"}=err;
  res.render("error.ejs", {err});
  // res.send("SOMETHING WENT WRONG");
  // res.status(statusCode).send(message);
});

app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
})