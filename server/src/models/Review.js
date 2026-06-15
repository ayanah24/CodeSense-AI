import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
         PrNumber:{
            type:Number,
            required:true
         },
            PrTitle:{
            type:String,
            required:true
         },
         author:{
            type:String,
            required:true
         },
         repoName:{
            type:String,
            required:true
         },
         commitSha:{
            type:String,
            required:true
         },

         //Ai review output
         summary:{
            type:String,
            required:true 
         },
         score:{
            overall:{type:Number, required:true},
            security:{type:Number, required:true},
            performance:{type:Number, required:true},
            quality:{type:Number, required:true},
            tests:{type:Number, required:true},
         },
         issues:[
            {
             type: {type:String},
             severity: {type:String},
             file: {type:String},
             line: {type:String},
             title: {type:String},
             description: {type:String},
             fix: {type:String},
            },
         ],
         positive:[String],

         //job status
         status:{
            type: String,
            enum:['pending','reviewed','failed','skipped'],
            default:'pending',
         },
         passed:{
            type:Boolean,
            default:false,
         },

},
{
timeStamps: true,
},
);

const Review = mongoose.model('Review',reviewSchema);

export default Review;