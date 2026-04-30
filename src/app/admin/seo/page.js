"use client";

import GscTab from "@/components/admin/GscTab";
import IndexNowPanel from "@/components/admin/IndexNowPanel";

const QUICK_LINKS = [
  {
    href: "https://search.google.com/search-console?resource_id=sc-domain%3Avosthermos.com",
    icon: "fab fa-google",
    label: "Search Console",
  },
  {
    href: "https://search.google.com/search-console/inspect?resource_id=sc-domain%3Avosthermos.com&id=https%3A%2F%2Fwww.vosthermos.com%2F",
    icon: "fas fa-circle-check",
    label: "Inspection URL",
  },
  {
    href: "https://www.google.com/search?q=site:vosthermos.com",
    icon: "fas fa-magnifying-glass",
    label: "site:Google",
  },
  {
    href: "https://www.bing.com/webmasters",
    icon: "fab fa-microsoft",
    label: "Bing Webmaster",
  },
];

export default function AdminSeoPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="admin-text text-2xl font-extrabold">Suivi SEO</h1>
          <p className="admin-text-muted mt-1 text-sm">
            Suivi par ville et mot-cle pour enqueter une page a la fois.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-card rounded-lg border px-3 py-2 text-sm font-bold admin-text hover:bg-white/5"
            >
              <i className={`${link.icon} mr-2`}></i>{link.label}
            </a>
          ))}
        </div>
      </div>

      <GscTab />

      <div className="mt-6">
        <IndexNowPanel />
      </div>
    </div>
  );
}
