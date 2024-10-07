
import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const UserSchema=new Schema({
  userName:{
    type:String,
    required:[true,'UserName is Required !'],
    unique:[true,'UserName should be unique'],
    lowercase:[true,'UserName should be in lowercase'],
    trim:true,
    index:true
  },
  email:{
    type:String,
    required:[true,'Email is Required !!'],
    unique:[true,'Email field must be unique !'],
    lowercase:[true,'Email should be in lowercase'],
    trim:true
  },
  fullName:{
    type:String,
    required:[true,'FullName is required !'],
    trim:true,
    index:true
  },
  avatar:{
    type:String, //Cloudinary URL
  },
  coverImage:{
    type:String, // Cloudinary URL
  },
  bio:{
    type:String
  },
  password:{
    type:String,
    required:[true,'Password is Required !']
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  refreshToken:{
    type:String
  }

},{timestamps:true});

// We want the code to run only when the changes in password field is made not everytime
UserSchema.pre("save",async function(next){
  if(!this.isModified("password")){
    return next();
  }
  try{
    // Hash the password before saving 
    this.password= await bcrypt.hash(this.password,10);
    next();
  }
  catch(err){
    next(err);
  }
})

// This portion checks the password :
UserSchema.methods.isPasswordCorrect=async function(password){
  return await bcrypt.compare(password,this.password);
}

export const User=mongoose.model("User",UserSchema);
