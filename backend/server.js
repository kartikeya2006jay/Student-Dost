const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/save", (req, res) => {
  fs.writeFileSync("data.json", JSON.stringify(req.body, null, 2));
  res.json({ status: "saved" });
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
