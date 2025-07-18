
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
 

//index route:
app.get("/listings",async (req, res)=>{
   const allListings = await Listing.find({});
   res.render("listings/index.ejs", {allListings}); //views folder no need to include in path,handled
});

//New route:
//get req on: listings/new => form => submit post req goes on "/listings" 
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs");
})

//create route:
app.post("/listings", async (req, res)=>{
    //let {title, description, image, price, country, location}=req.body;
    //instead of writing this long syntax , we can create the form as object 
    // let listing = req.body.listing;
   const newListing =  new Listing(req.body.listing)
   await newListing.save()
    res.redirect("/listings");
})


//edit route:
//get req on "/listings/:id/edit"
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", {listing});
});

//update route:
//put request on "/listings/:id"
app.put("/listings/:id", async (req, res) => {
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing});
  res.redirect(`/listings/${id}`);
});

//delete route:
app.delete("/listings/:id", async (req, res)=>{
    let {id}=req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings"); 
})

//show route: 
//get req on "/listings/:id" => show route , specific listing data(view) 
app.get("/listings/:id", async (req, res)=>{
let {id}=req.params;
const listing = await Listing.findById(id);
res.render("listings/show.ejs", {listing});
})


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




app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
})