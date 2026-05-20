const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const crypto = require("crypto");
const QRCode = require("qrcode");

const Voter = require("./models/Voter");

const app = express();
const upload = multer();

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/votingDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Registration Route
app.post("/register", upload.single("photo"), async (req, res) => {

  try {

    // Get Form Data
    const { name, govtId, dob, email, phone } = req.body;

    // Generate Random Salt
    const salt = crypto.randomBytes(16).toString("hex");

    // Generate Voter Token
    const voterToken = crypto
      .createHash("sha256")
      .update(name + govtId + dob + salt)
      .digest("hex");

    // Generate Biometric Hash
    const biometricHash = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex");

    // Generate RSA Public & Private Keys
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {

      modulusLength: 2048,

      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },

      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },

    });

    // Save Data to MongoDB
    await Voter.create({

      name,
      govtId,
      dob,
      email,
      phone,
      voterToken,
      biometricHash,
      publicKey,
      salt,
      hasVoted: false

    });

    // QR Data
    const qrData = JSON.stringify({
      voterToken,
      privateKey
    });

    // Generate QR Image
    const qrImage = await QRCode.toDataURL(qrData);

    // Success Response
    res.send(`

      <h1>Registration Successful</h1>

      <h3>Your QR Code:</h3>

      <img src="${qrImage}" width="300"/>

    `);

  } catch (error) {

    console.log(error);

    res.send(error.message);

  }

});

// Default Route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Start Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});