const mongoose = require("mongoose")

const connectDB = async () => {
  try {
   
    console.log('connecting db');
    
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    console.log("MongoDB Connected...");

  } 
  catch (err) {
  
    console.error("error at connecting db", err.message)
    process.exit(1)
  
  }
}

module.exports = connectDB
