import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
   {
      //ownership of repo
      userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: false,
         index: true,
      },

      //pr info
      prNumber: {
         type: Number,
         required: true
      },
      prTitle: {
         type: String,
         required: true
      },
      author: {
         type: String,
         required: true
      },
      repoName: {
         type: String,
         required: true
      },
      commitSha: {
         type: String,
         required: true
      },

      //Ai review output
      summary: {
         type: String,
         required: true
      },
      score: {
         overall: { type: Number, required: true },
         security: { type: Number, required: true },
         performance: { type: Number, required: true },
         quality: { type: Number, required: true },
         tests: { type: Number, required: true },
      },
      issues: [
         {
            type: { type: String },
            severity: { type: String },
            file: { type: String },
            line: { type: String },
            title: { type: String },
            description: { type: String },
            fix: { type: String },
         },
      ],
      positives: [String],

      //job status
      status: {
         type: String,
         enum: ['pending', 'reviewed', 'failed', 'skipped'],
         default: 'pending',
      },
      passed: {
         type: Boolean,
         default: false,
      },

      jobId: {
         type: String,
         required: true,
         unique: true,
         index: true,
      },

   },
   { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;