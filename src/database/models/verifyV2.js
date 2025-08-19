const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    Guild: String,
    Channel: String,
    Role: String,
    LogChannel: String,
});

module.exports = mongoose.model('verifyV2', Schema);
