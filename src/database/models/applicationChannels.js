const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    Channel: String,
    Log: String,
    Roles: Array
});

module.exports = mongoose.model("applicationChannels", Schema);
