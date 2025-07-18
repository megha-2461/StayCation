const express = require('express');
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
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")


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

//after using session, we will use passportt
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 


app.use((req, res, next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  // console.log(res.locals.success);
  next();
})

/* app.get("/demouser", async (req, res)=>{
let fakeUser = new User({
email: "student@gmail.com",
username: "student"
})
let registeredUser = await User.register(fakeUser, "helloworld"); //{user, pwd} this method checks automatically if usrname is unique or not
res.send(registeredUser);
}); */


 
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);



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