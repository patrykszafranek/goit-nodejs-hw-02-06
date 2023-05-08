require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app.js");
const uriDb =
  "mongodb+srv://test:test@cluster0.q0cc5xk.mongodb.net/?retryWrites=true&w=majority";
const PORT = process.env.PORT || 3000;

const connection = mongoose.connect(uriDb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connection
  .then(() => {
    app.listen(PORT, function () {
      console.log("Database connection successful");
    });
  })
  .catch((error) => {
    console.log("Database connection error:", error);
    process.exit(1);
  });
