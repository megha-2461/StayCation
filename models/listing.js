const mongoose=require('mongoose');
const Schema = mongoose.Schema; //to avoid typing this again and again
const Review = require("./review.js");
const User = require("./user.js");

//creating schema:
const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: {
    url:  String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  geometry: {
    type: {
  type: String,
  enum: ['Point'],
  required: true,
  default: 'Point'
    },
  coordinates: {
    type: [Number],
    required: true,
    default: [0, 0]
  },

  }
  
});

listingSchema.post("findOneAndDelete", async(listing)=>{
  if (listing){
   await Review.deleteMany({_id: {$in : listing.reviews}});
  }
})

//creating model:
const Listing = mongoose.model("Listing", listingSchema);

module.exports=Listing;

