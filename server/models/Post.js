const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const PostSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    required: false
  },
  author: {
    type: String,
    required: true
  },
  tags: {
    type: [Schema.Types.ObjectId],
    ref: 'Tag',
    required: false,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);