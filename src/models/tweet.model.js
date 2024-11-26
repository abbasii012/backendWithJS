import mongoose, { Schema } from "mongoose";

// Define the Tweet schema
const tweetSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  video: {
    type: Schema.Types.ObjectId,
    ref: "Video",
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
}, {
  timestamps: true
});

// Create a model from the schema
export const Tweet = mongoose.model("Tweet", tweetSchema);

