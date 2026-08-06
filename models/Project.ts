import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    image: {
      type: String,
      default: "",
    },
    tags: {
      type: String,
      default: "",
    },
    demoLink: {
      type: String,
      default: "",
    },
    githubLink: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Web",
    },
    date: {
      type: String,
      default: "",
    },
    featured: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "projects",
  }
);

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
