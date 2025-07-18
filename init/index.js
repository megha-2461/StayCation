const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing = require("../models/listing.js") //model

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

const initDB = async ()=>{
await Listing.deleteMany({}); //deletes any existing data
await Listing.insertMany(initData.data); //adds new data
console.log("data initialised")
};

initDB();