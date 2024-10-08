const mongoose = require('mongoose');
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
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
  views:{
    type:Number,
    default:0
  },
  isPublished:{
    type:Boolean,
    default:true
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:[true,"Owner of the post is required "]
  }
},{timestamps:true});

PostSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('Post', PostSchema);