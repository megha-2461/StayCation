const Joi = require("joi");
const review = require("./models/review");

const categories = [
  "Trending",
  "Rooms",
  "Iconic Cities",
  "Mountains",
  "Castles",
  "Amazing Pools",
  "Camping",
  "Farms",
  "Arctic"
];

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
         description: Joi.string().required(),
          location: Joi.string().required(),
           country: Joi.string().required(),
           price: Joi.string().required().min(0),
               category: Joi.string().valid(...categories).required(),
        //    image:
        //    Joi.object({
        //    url: Joi.string().uri().allow("", null)
        //      }).required()
            // Joi.string().allow("", null),
    }).required()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required()
    }).required()
}) 