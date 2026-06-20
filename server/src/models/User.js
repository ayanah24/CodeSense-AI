import mongoose from 'mongoose';

const userSchema= new mongoose.Schema({
    githubId: {type:String,required:true,unique:true},
    username:{type:String, required:true},
    displayName:{type:String},
    avatarUrl:{type:String},
    email:{type:String},
    role:{type:String, enum:['user','admin'],default:'user'},
},{timestamps:true});

export default mongoose.model('User',userSchema);
