import Link from "next/link";
import { getBlogImage } from "@/lib/blog-images";

const categoryColors = {
  conseils: "bg-blue-500",
  entretien: "bg-green-500",
  guides: "bg-purple-500",
  nouvelles: "bg-orange-500",
};

const categoryLabels = {
  conseils: "Conseils",
  entretien: "Entretien",
  guides: "Guides",
  nouvelles: "Nouvelles",
};

export default function BlogCard({ post }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("fr-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const badgeColor = categoryColors[post.category] || "bg-gray-500";
  const badgeLabel = categoryLabels[post.category] || post.category;
  const coverImage = getBlogImage(post);

  return (
    <Link
      href={`/blogue/${post.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverImage}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 ${badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--color-teal)] transition-colors line-clamp-2 mb-2">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{date}</span>
          <span className="text-[var(--color-teal)] font-medium group-hover:underline">
            Lire la suite &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
