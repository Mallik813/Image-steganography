const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// var postSchema = new Schema({  
//   post:  {
//       type: String,
//       required: true
//   }
// });
const postSchema = new mongoose.Schema({
  text: {
    type: String
  },
  username: {
    type: String
  },
  // image: {
  //   type: String,
  //   required: true
  // },
  date: {
    type: Date,
    default: Date.now
  },
  by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  likes: {
    type: Number,
    default: 0,
    required: false
  },
  copyOf: {
    type: String
  },
  img:  {
      data: Buffer,
      contentType: String
  },
  email: {
    type: String
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
