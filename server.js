require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const privateRoutes = require("./routes/private");
const connectDB = require("./config/db");
const cors = require("cors");
//const gauth = require("./config/gauth");

connectDB();
//gauth();

const app = express();

app.use(express.json());
if(process.env.NODE_ENV==='development'){
  app.use(cors({
    origin:process.env.CLIENT_URL
  }));
}

app.get("/", (req, res) => {
  res.json({ message: "API running..." });
});

app.use("/api/auth",authRoutes);
app.use("/api/private",privateRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on("unhandledRejection",(err)=>{
  console.log(`error:${err}`);
  server.close(()=> process.exit(1));
})
