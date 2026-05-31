import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
  },
  message: {
    type: String,
    required: [true, "Please provide a message"],
  },
  source: {
    type: String,
  },
  service: {
    type: String,
  },
  read: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
