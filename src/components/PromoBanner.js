import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export default async function PromoBanner() {
  const now = new Date();

  const promo = await prisma.promotion.findFirst({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  if (!promo) return null;

  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "fr";
  const prefix = locale === "en" ? "/en" : "";
  const ctaLabel = locale === "en" ? "View products" : "Voir les produits";

  // Render a spacer + fixed banner so the header shifts down
  return (
    <>
      {/* Spacer to push content down */}
      <div className="h-9" id="promo-spacer" />
      {/* Fixed banner */}
      <div
        className="fixed top-0 left-0 w-full z-[60] py-2 px-4 text-center text-white text-sm font-semibold"
        style={{ backgroundColor: promo.bgColor }}
      >
        <i className="fas fa-tag mr-2"></i>
        {promo.title}
        {promo.description && (
          <span className="font-normal ml-2 opacity-90 hidden sm:inline">— {promo.description}</span>
        )}
        {promo.category && (
          <a
            href={`${prefix}/boutique/${promo.category.slug}`}
            className="ml-3 underline underline-offset-2 font-bold hover:opacity-80"
          >
            {ctaLabel}
          </a>
        )}
      </div>
      {/* CSS to offset header and pages when promo is active */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --promo-h: 36px; }
        .header-fixed { top: var(--promo-h, 0px) !important; }
        .pt-\\[85px\\] { padding-top: calc(85px + var(--promo-h, 0px)) !important; }
      `}} />
    </>
  );
}
