// db.js

import mongoose from "mongoose";

const url = "mongodb://localhost:27017/mysessionsdb";

mongoose.connect(url);

// Event listeners
mongoose.connection.on("connected", () => {
  console.log("Connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.log("DB Connection Error:", err);
});

export default mongoose;
