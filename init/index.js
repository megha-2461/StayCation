if (process.env.NODE_ENV!=='production'){
require('dotenv').config();
}
const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing = require("../models/listing.js") //model

const dbUrl = process.env.ATLASDB_URL;
console.log(dbUrl);

main()
.then(()=>{
console.log("connected to DB");
})
.catch((err)=>{
console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl)
}

const initDB = async ()=>{
await Listing.deleteMany({}); //deletes any existing data
initData.data = initData.data.map((obj)=>({...obj, owner: "687343ef0c286ccf217784a9"}))
await Listing.insertMany(initData.data); //adds new data
console.log("data initialised")
};

// initDB();

//adding categories to already listed samples
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

async function geocode(address) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
      headers: {
        'User-Agent': 'StayCationSeeder/1.0'
      }
    });
    const data = await res.json();
    if (data.length > 0) {
      return {
        type: "Point",
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
      };
    }
  } catch (err) {
    console.error(`Failed to geocode "${address}":`, err);
  }
  return {
    type: "Point",
    coordinates: [0, 0] 
  };
}

const initGeoDB = async () => {
  await Listing.deleteMany({});
  console.log("🗑️ Old listings deleted");

  const ownerId = "687343ef0c286ccf217784a9";
  const listingsWithGeo = [];

 for (let listing of initData.data) {
  const geometry = await geocode(listing.location);

  const category = categories[Math.floor(Math.random() * categories.length)]; // random category

  listingsWithGeo.push({ ...listing, owner: ownerId, geometry, category });
  console.log(`Geocoded: ${listing.location}, Assigned category: ${category}`);
}


  await Listing.insertMany(listingsWithGeo);
  console.log("Seeded listings with geocoded geometry");
};
  
initGeoDB();   // Insert listings with geocoded coordinates
