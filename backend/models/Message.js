const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid');

const MessageSchema = new mongoose.Schema({
  // _id: { type: String, default: uuidv4, required: true },
  sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  recipient: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  text: String,
  file: String,
}, {timestamps:true});

const MessageModel = mongoose.model('Message', MessageSchema);

module.exports = MessageModel;