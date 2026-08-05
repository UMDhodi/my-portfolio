import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
    },
    date: {
      type: String,
      required: [true, "Please provide a date"],
    },
    tag: {
      type: String,
      required: [true, "Please provide a tag"],
    },
    stack: {
      type: String,
      default: "",
    },
    excerpt: {
      type: String,
      required: [true, "Please provide an excerpt"],
    },
    slug: {
      type: String,
    },
    link: {
      type: String,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "blogs",
  }
);

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
