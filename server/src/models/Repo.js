import mongoose from 'mongoose';

const repoSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  githubRepoId: { type: Number, required: true, unique: true },
  repoName:     { type: String, required: true },  
  isActive:     { type: Boolean, default: true },
  hookId:       { type: Number } ,
}, { timestamps: true });

// Index for fast webhook lookup 
repoSchema.index({ repoName: 1 });
repoSchema.index({ userId: 1 });

export default mongoose.model('Repo', repoSchema);
 
