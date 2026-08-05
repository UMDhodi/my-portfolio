import type { Metadata } from "next";
import BlogClient from "@/app/components/blog";
import { getBlogPosts } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Field notes from the build vibe coding logs, hackathon post-mortems, and AI automation experiments by Mayank Dhodi.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogClient initialPosts={posts} />;
}
