const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema({

  name: String,
  govtId: String,
  dob: String,
  email: String,
  phone: String,
  voterToken: String,
  biometricHash: String,
  publicKey: String,
  salt: String,
  hasVoted: Boolean

});

module.exports = mongoose.model("Voter", voterSchema);