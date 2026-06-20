"use server";

import dbConnect from "@/lib/mongodb";
import Certification from "@/models/Certification";
import Timeline from "@/models/Timeline";
import Message from "@/models/Message";
import { verifyAuth } from "./auth";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
// --- TIMELINE (MONGODB) ---

export async function getTimeline() {
  await dbConnect();
  const items = await Timeline.find({}).sort({ year: 1, createdAt: 1 });
  return JSON.parse(JSON.stringify(items));
}

export async function saveTimelineItem(formData: FormData) {
  if (!(await verifyAuth())) throw new Error("Unauthorized");
  await dbConnect();

  const _id = formData.get("_id")?.toString();
  const year = formData.get("year")?.toString() || "";
  const title = formData.get("title")?.toString() || "";
  const desc = formData.get("desc")?.toString() || "";

  if (_id) {
    await Timeline.findByIdAndUpdate(_id, { year, title, desc });
  } else {
    await Timeline.create({ year, title, desc });
  }

  revalidatePath("/");
  revalidatePath("/admin/dashboard/timeline");
  return { success: true };
}

export async function deleteTimelineItem(id: string) {
  if (!(await verifyAuth())) throw new Error("Unauthorized");
  await dbConnect();
  await Timeline.findByIdAndDelete(id);
  revalidatePath("/");
  revalidatePath("/admin/dashboard/timeline");
  return { success: true };
}

// --- CERTIFICATIONS (MONGODB) ---

export async function getCertifications() {
  await dbConnect();
  const certs = await Certification.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(certs));
}

export async function saveCertification(formData: FormData) {
  if (!(await verifyAuth())) throw new Error("Unauthorized");
  await dbConnect();
  
  const _id = formData.get("_id")?.toString();
  
  let imagePath = formData.get("image")?.toString() || "";
  const imageFile = formData.get("imageFile") as File | null;
  
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert to base64 to store as string in MongoDB
    imagePath = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
  }

  const data = {
    id: formData.get("id")?.toString(),
    title: formData.get("title")?.toString(),
    issuer: formData.get("issuer")?.toString(),
    date: formData.get("date")?.toString(),
    credId: formData.get("credId")?.toString(),
    image: imagePath,
    link: formData.get("link")?.toString(),
  };

  if (_id) {
    await Certification.findByIdAndUpdate(_id, data);
  } else {
    await Certification.create(data);
  }
  
  revalidatePath("/");
  revalidatePath("/admin/dashboard/certifications");
  return { success: true };
}

export async function deleteCertification(id: string) {
  if (!(await verifyAuth())) throw new Error("Unauthorized");
  await dbConnect();
  await Certification.findByIdAndDelete(id);
  revalidatePath("/");
  revalidatePath("/admin/dashboard/certifications");
  return { success: true };
}

// --- MESSAGES (MONGODB) ---

export async function getMessages() {
  if (!(await verifyAuth())) throw new Error("Unauthorized");
  await dbConnect();
  const messages = await Message.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(messages));
}

export async function saveMessage(formData: FormData) {
  // Public route, no auth check needed to send a message
  await dbConnect();
  
  await Message.create({
    id: Date.now().toString(),
    name: formData.get("name")?.toString() || "Anonymous",
    email: formData.get("email")?.toString(),
    message: formData.get("message")?.toString(),
    service: formData.get("service")?.toString() || "",
    source: formData.get("source")?.toString() || "Portfolio",
    read: false,
  });
  
  return { success: true };
}

export async function markMessageRead(id: string) {
  if (!(await verifyAuth())) throw new Error("Unauthorized");
  await dbConnect();
  await Message.findByIdAndUpdate(id, { read: true });
  revalidatePath("/admin/dashboard/messages");
  return { success: true };
}

export async function deleteMessage(id: string) {
  if (!(await verifyAuth())) throw new Error("Unauthorized");
  await dbConnect();
  await Message.findByIdAndDelete(id);
  revalidatePath("/admin/dashboard/messages");
  return { success: true };
}

export async function replyMessage(to: string, subject: string, htmlContent: string) {
  if (!(await verifyAuth())) throw new Error("Unauthorized");
  
  // Set up standard SMTP transporter (needs env vars)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html: htmlContent,
    });
    return { success: true };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
}
