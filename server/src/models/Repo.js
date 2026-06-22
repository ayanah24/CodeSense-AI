import mongoose from 'mongoose';

const repoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    githubRepoId: {
      type: String,
      required: true,
    },
    repoName: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

repoSchema.index({ userId: 1, githubRepoId: 1 }, { unique: true });

export default mongoose.model('Repo', repoSchema);
