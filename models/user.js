const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var postSchema = new Schema({  
  post:  {
      type: mongoose.Schema.Types.ObjectId,
      required: true
  }
});
var notifSchema = new Schema({  
  id:  {
      type: mongoose.Schema.Types.ObjectId,
      required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  postID: {
    type: mongoose.Schema.Types.ObjectId,
      required: true
  }
});
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  posts: [postSchema],
  notifications: [notifSchema],
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
