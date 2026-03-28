import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { autoLinkContent } from "@/lib/auto-linker";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let post = null;
  try {
    post = await prisma.blogPost.findUnique({ where: { slug } });
  } catch {
    // Table may not exist yet
  }

  if (!post || post.status !== "published") {
    return { title: "Article non trouve | Vosthermos" };
  }

  return {
    title: `${post.title} | Blogue Vosthermos`,
    description: post.excerpt,
    alternates: { canonical: `https://www.vosthermos.com/blogue/${post.slug}` },
    openGraph: {
      type: "article",
      url: `https://www.vosthermos.com/blogue/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      images: post.coverImage
        ? [{ url: post.coverImage }]
        : [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
      locale: "fr_CA",
      publishedTime: post.publishedAt ? post.publishedAt.toISOString() : undefined,
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.authorName],
    },
  };
}

function extractHeadings(html) {
  const headings = [];
  const regex = /<(h[23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = match[1].toLowerCase();
    const text = match[3].replace(/<[^>]*>/g, "").trim();
    const id =
      match[2] ||
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    headings.push({ level, text, id });
  }
  return headings;
}

function addIdsToHeadings(html) {
  return html.replace(
    /<(h[23])([^>]*)>(.*?)<\/\1>/gi,
    (match, tag, attrs, content) => {
      if (attrs.includes('id="')) return match;
      const text = content.replace(/<[^>]*>/g, "").trim();
      const id = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
    }
  );
}

function estimateReadingTime(html) {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const categoryLabels = {
  conseils: "Conseils",
  entretien: "Entretien",
  guides: "Guides",
  nouvelles: "Nouvelles",
};

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  let post = null;
  try {
    post = await prisma.blogPost.findUnique({ where: { slug } });
  } catch {
    // Table may not exist yet
  }

  if (!post || post.status !== "published") {
    notFound();
  }

  const headings = extractHeadings(post.content);
  const contentWithIds = autoLinkContent(addIdsToHeadings(post.content));
  const readingTime = estimateReadingTime(post.content);

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("fr-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `https://www.vosthermos.com/blogue/${post.slug}`,
    datePublished: post.publishedAt ? post.publishedAt.toISOString() : undefined,
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Vosthermos",
      url: "https://www.vosthermos.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png",
      },
    },
    image: post.coverImage || "https://www.vosthermos.com/images/Vos-Thermos-Logo.png",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.vosthermos.com/blogue/${post.slug}`,
    },
  };

  return (
    <div className="pt-[75px]">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Hero */}
      <div className="bg-[var(--color-teal-dark)] py-12">
        <div className="max-w-[900px] mx-auto px-6">
          <Link
            href="/blogue"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
            Retour au blogue
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {categoryLabels[post.category] || post.category}
            </span>
            <span className="text-white/40 text-sm">{publishedDate}</span>
            <span className="text-white/40 text-sm">
              <i className="fas fa-clock mr-1"></i>
              {readingTime} min de lecture
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            {post.title}
          </h1>
          <p className="text-white/60 mt-4 text-lg">{post.excerpt}</p>
          <div className="flex items-center gap-3 mt-6">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fas fa-user text-white/60"></i>
            </div>
            <div>
              <p className="text-white text-sm font-medium">{post.authorName}</p>
              {post.aiGenerated && (
                <p className="text-white/40 text-xs">
                  <i className="fas fa-robot mr-1"></i>Assiste par IA
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cover image */}
      {post.coverImage && (
        <div className="max-w-[900px] mx-auto px-6 -mt-4">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
          />
        </div>
      )}

      {/* Content + Sidebar */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Table of contents sidebar */}
          {headings.length > 2 && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-[100px]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                  Table des matieres
                </h4>
                <nav className="space-y-2">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className={`block text-sm text-gray-500 hover:text-[var(--color-teal)] transition-colors ${
                        h.level === "h3" ? "pl-4" : ""
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Article content */}
          <article className="flex-1 min-w-0">
            <div
              className="prose prose-lg max-w-none
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-a:text-[var(--color-teal)] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900
                prose-ul:text-gray-700 prose-li:text-gray-700
                prose-img:rounded-xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-100">
                {post.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <ShareButton slug={post.slug} title={post.title} />
            </div>
          </article>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[var(--color-teal-dark)] to-[var(--color-teal)] py-16">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Besoin d&apos;aide avec vos portes ou fenetres?
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Nos experts sont la pour vous conseiller et effectuer toutes vos
            reparations. Soumission gratuite!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:15148258411"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-8 py-4 rounded-xl hover:bg-[var(--color-red-light)] transition-colors text-lg"
            >
              <i className="fas fa-phone"></i>
              514-825-8411
            </a>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-teal-dark)] font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg"
            >
              <i className="fas fa-file-alt"></i>
              Demander une soumission
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareButton({ slug, title }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-500 font-medium">Partager:</span>
      <CopyLinkButton slug={slug} />
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=https://www.vosthermos.com/blogue/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors"
        title="Partager sur Facebook"
      >
        <i className="fab fa-facebook-f"></i>
      </a>
    </div>
  );
}

function CopyLinkButton({ slug }) {
  return (
    <button
      className="copy-link-btn w-10 h-10 rounded-full bg-gray-100 hover:bg-[var(--color-teal)]/10 flex items-center justify-center text-gray-500 hover:text-[var(--color-teal)] transition-colors"
      title="Copier le lien"
      data-url={`https://www.vosthermos.com/blogue/${slug}`}
      onClick={undefined}
    >
      <i className="fas fa-link"></i>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          document.addEventListener('click', function(e) {
            var btn = e.target.closest('.copy-link-btn');
            if (btn) {
              navigator.clipboard.writeText(btn.dataset.url).then(function() {
                var icon = btn.querySelector('i');
                icon.className = 'fas fa-check text-green-500';
                setTimeout(function() { icon.className = 'fas fa-link'; }, 2000);
              });
            }
          });
        `,
        }}
      />
    </button>
  );
}
