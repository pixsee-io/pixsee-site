import BlogPostPage from "@/components/blog/BlogPostPage";

export default function BlogPost({ params }: { params: { slug: string } }) {
  return <BlogPostPage slug={params.slug} />;
}
