import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Timeline from "@/models/Timeline";

// POST /api/seed-timeline — one-time migration from timeline.json to MongoDB
// Protect with a secret to prevent public access
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timelineData = [
    {
      year: "2021",
      title: "Bachelor of Computer Applications",
      desc: "Complete my graduation from Chandigarh university in Bachelor of Computer Applications (BCA)",
    },
    {
      year: "2023",
      title: "Data Analytics Essentials",
      desc: "Data Analysis skills and bring valuable insights to the table",
    },
    {
      year: "2024",
      title: "Google Data Analytics",
      desc: "Understand how to clean and organize data for analysis, and complete analysis and calculations using spreadsheets, SQL and Python",
    },
    {
      year: "2026",
      title: "Claude Code in Action",
      desc: "This course focused on practical implementation of AI-assisted coding using Claude, covering real-world workflows, structured prompting for development tasks, and improving efficiency in writing, debugging, and understanding code. Gained hands-on exposure to leveraging AI for faster development cycles, better problem-solving, and building more reliable solutions. This adds a strong layer to my skill set in AI-driven development and automation.",
    },
  ];

  await dbConnect();

  // Only seed if timeline is empty (idempotent)
  const existing = await Timeline.countDocuments();
  if (existing > 0) {
    return NextResponse.json({ message: `Already seeded. ${existing} items exist.` });
  }

  await Timeline.insertMany(timelineData);

  return NextResponse.json({ success: true, inserted: timelineData.length });
}
