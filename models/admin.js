var mongoose = require("mongoose");
var passportlocalmongoose = require("passport-local-mongoose");

var adminSchema = new mongoose.Schema({
    username: String,
    password: String
})

adminSchema.plugin(passportlocalmongoose);

module.exports = mongoose.model("Admin",adminSchema);