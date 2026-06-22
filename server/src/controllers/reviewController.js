import mongoose from "mongoose";
import Review from "../models/Review.js";

//get all /api/reviews
async function getAllReviews(req,res) {
    try{
        const reviews= await Review.find({userId:req.user.userId})
        .sort({createdAt:-1})
        .select(
            'prNumber prTitle author repoName score status passed createdAt'
        )
        .limit(50);

        res.json({
            success:true,
            count:reviews.length,
            data:reviews,
        });
    }catch(error){
        console.error('Error fetching reviews:',error.message);
        res.status(500).json({
            success:false,
            error:'Failed to fetch reviews',
        });
    }   
}

//get api/reviews/:id
async function getReviewsById(req,res) {
    try{
        const review = await Review.findOne({
           _id:req.params.id,
           userId:req.user.userId,
        });

        if(!review){
            return res.status(404).json({
                success:false,
                error:'Review not found',
            });
        }

        res.json({
            success:true,
            data:review,
        });
    }catch(error){
        console.error('Error fetching review:',error.message);
        res.status(500).json({
            success:false,
            error:'failed to fetch Review',
        });

    }
}

//get api/review/repo/:reponame
async function getReviewsByRepo(req,res) {
    try{
        const repoName = decodeURIComponent(req.params.repoName);

        const reviews = await Review.find({ repoName, userId: req.user.userId })
        .sort({createdAt:-1})
        .select('prNumber prTitle author score status passed createdAt');

        res.json({
            success:true,
            count:reviews.length,
            data:reviews,
        });
    }catch(error){
       console.error('Error fetching repo reviews:',error.message);
       res.status(500).json({
        success:false,
        error:'Failed to fetch repo reviews',
       });
    }
}

//get api reviews stats
async function getStats(req,res) {
    try{
        const userId = new mongoose.Types.ObjectId(req.user.userId);
        const filter = { userId };
        const totalReviews = await Review.countDocuments(filter);
        const passedReview = await Review.countDocuments({ ...filter, passed: true });
        const failedReview = await Review.countDocuments({ ...filter, passed: false });

        //avg score for all result
        const avgScoreResult = await Review.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: '$score.overall' },
                },
            },
        ]);

        const avgScore=avgScoreResult.length>0
        ?Math.round(avgScoreResult[0].avgScore)
        :0;
      
        //total issues found across all reviews
        const totalIssuesResult = await Review.aggregate([
            { $match: { userId } },
            {
             $group: {
          _id: null,
          totalIssues: { $sum: { $size: '$issues' } },
            },
        },
        ]);
        
        const totalIssues =totalIssuesResult.length>0
        ?totalIssuesResult[0].totalIssues
        :0;

        res.json({
            success:true,
            data:{
                totalReviews,
                passedReview,
                failedReview,
                avgScore,
                totalIssues,
            },
        }); 
    }catch(error){
        console.error('Error fetching stats:',error.message);
        res.status(500).json({
            success:false,
            error:'Failed to fetch stats',
        });
    }
}

export {getAllReviews,getReviewsById,getReviewsByRepo,getStats};