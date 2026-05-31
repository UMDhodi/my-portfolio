import mongoose from "mongoose";

const CertificationSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  title: {
    type: String,
    required: [true, "Please provide a title"],
  },
  issuer: {
    type: String,
    required: [true, "Please provide an issuer"],
  },
  date: {
    type: String,
    required: [true, "Please provide a date"],
  },
  credId: {
    type: String,
  },
  image: {
    type: String,
  },
  link: { type: String, required: false },
}, {
  timestamps: true,
  collection: "certificates"
});

export default mongoose.models.Certification || mongoose.model("Certification", CertificationSchema);
