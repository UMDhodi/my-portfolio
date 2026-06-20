import mongoose from "mongoose";

const TimelineSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  year: {
    type: String,
    required: [true, "Please provide a year"],
  },
  title: {
    type: String,
    required: [true, "Please provide a title"],
  },
  desc: {
    type: String,
    required: [true, "Please provide a description"],
  },
}, {
  timestamps: true,
  collection: "timeline",
});

export default mongoose.models.Timeline || mongoose.model("Timeline", TimelineSchema);
