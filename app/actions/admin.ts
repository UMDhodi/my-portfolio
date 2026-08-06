"use server";

import dbConnect from "@/lib/mongodb";
import Certification from "@/models/Certification";
import Blog from "@/models/Blog";
import Project from "@/models/Project";
import Timeline from "@/models/Timeline";
import Message from "@/models/Message";
import { verifyAuth } from "./auth";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
// --- BLOG POSTS (MONGODB) ---

export async function getBlogPosts() {
  try {
    await dbConnect();
    const posts = await Blog.find({ published: true }).sort({ date: -1, createdAt: -1 });
    return JSON.parse(JSON.stringify(posts));
  } catch {
    // Cluster not found or connection error — return empty so UI shows fallback
    return [];
  }
}

export async function saveBlogPost(formData: FormData) {
  if (!(await verifyAuth())) throw new Error("Unauthorized");
  await dbConnect();

  const _id = formData.get("_id")?.toString();
  const publishedVal = formData.get("published");
  
  const rawExcerpt = formData.get("excerpt")?.toString() || "";
  const plainExcerptText = rawExcerpt.replace(/<[^>]*>/g, "").trim();

  // Validate that excerpt is not empty or just whitespace / empty HTML tags
  if (!rawExcerpt.trim() || !plainExcerptText) {
    return { success: false, error: "Please provide content / excerpt for the blog post." };
  }

  const data = {
    title: formData.get("title")?.toString()?.trim() || "Untitled Post",
    date: formData.get("date")?.toString() || new Date().toISOString().split("T")[0],
    tag: formData.get("tag")?.toString()?.trim() || "Tech",
    stack: formData.get("stack")?.toString()?.trim() || "",
    excerpt: rawExcerpt.trim(),
    slug: formData.get("slug")?.toString()?.trim() || "",
    link: formData.get("link")?.toString()?.trim() || "",
    published: publishedVal === "true" || publishedVal === "on" || publishedVal === "1" || publishedVal === null ? true : false,
  };

  try {
    if (_id) {
      await Blog.findByIdAndUpdate(_id, data);
    } else {
      await Blog.create(data);
    }

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin/dashboard/blog");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save blog post." };
  }
}

export async function deleteBlogPost(id: string) {
  if (!(await verifyAuth())) throw new Error("Unauthorized");
  await dbConnect();
  await Blog.findByIdAndDelete(id);
  revalidatePath("/");
  revalidatePath("/blog");
  return { success: true };
}

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
  try {
    await dbConnect();
    const certs = await Certification.find({}).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(certs));
  } catch {
    return [];
  }
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

function sanitizeText(str: unknown, maxLength: number): string {
  if (typeof str !== "string") return "";
  return str
    .trim()
    .substring(0, maxLength)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function saveMessage(formData: FormData) {
  // Public route, no auth check needed to send a message
  await dbConnect();

  const name = sanitizeText(formData.get("name"), 100) || "Anonymous";
  const email = sanitizeText(formData.get("email"), 150);
  const message = sanitizeText(formData.get("message"), 5000);
  const service = sanitizeText(formData.get("service"), 100);
  const source = sanitizeText(formData.get("source"), 100) || "Portfolio";

  if (!email || !message) {
    return { success: false, error: "Email and message are required." };
  }
  
  await Message.create({
    id: Date.now().toString(),
    name,
    email,
    message,
    service,
    source,
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

// --- PROJECTS (MONGODB) ---

export async function getProjects() {
  try {
    await dbConnect();
    const projects = await Project.find({}).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(projects));
  } catch {
    return [];
  }
}

export async function saveProject(formData: FormData) {
  if (!(await verifyAuth())) throw new Error("Unauthorized");
  await dbConnect();

  const _id = formData.get("_id")?.toString();

  let imagePath = formData.get("image")?.toString() || "";
  const imageFile = formData.get("imageFile") as File | null;

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    imagePath = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
  }

  const featuredVal = formData.get("featured");

  const data = {
    title: formData.get("title")?.toString()?.trim() || "Untitled Project",
    description: formData.get("description")?.toString()?.trim() || "",
    image: imagePath,
    tags: formData.get("tags")?.toString()?.trim() || "",
    demoLink: formData.get("demoLink")?.toString()?.trim() || "",
    githubLink: formData.get("githubLink")?.toString()?.trim() || "",
    category: formData.get("category")?.toString()?.trim() || "Web",
    date: formData.get("date")?.toString()?.trim() || new Date().toISOString().split("T")[0],
    featured: featuredVal === "true" || featuredVal === "on" || featuredVal === "1" || featuredVal === null ? true : false,
  };

  try {
    if (_id) {
      await Project.findByIdAndUpdate(_id, data);
    } else {
      await Project.create(data);
    }

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin/dashboard/projects");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save project." };
  }
}

export async function deleteProject(id: string) {
  if (!(await verifyAuth())) throw new Error("Unauthorized");
  await dbConnect();
  await Project.findByIdAndDelete(id);
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/dashboard/projects");
  return { success: true };
}
