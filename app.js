const express=require('express');
const app=express();
const mongoose=require('mongoose');


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
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./routes/listing.js")
const reviews = require("./routes/review.js")

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

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly: true //to prevent cross scripting attacks
  }
}
//basic api:
app.get("/", (req, res)=>{
    res.send("i am root");
});

app.use(session(sessionOptions));
app.use(flash()); //must be before routes

app.use((req, res, next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  // console.log(res.locals.success);
  next();
})
 
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);



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