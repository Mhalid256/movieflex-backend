import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  likedMovies: Array,
});

// Add to UserModel.js
userSchema.index({ email: 1 });
userSchema.index({ referenceId: 1 });

export default mongoose.model("users", userSchema);
