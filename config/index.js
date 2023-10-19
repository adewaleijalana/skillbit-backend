const connectDB = require("./db");

const initializeConfig = async()=>{

    connectDB();

}

initializeConfig()
