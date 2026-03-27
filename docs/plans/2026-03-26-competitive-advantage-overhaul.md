# Vosthermos Competitive Advantage Overhaul

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 14 features to make Vosthermos the best website in the Quebec thermos/window repair market.

**Architecture:** Next.js 16 App Router, Prisma 7 + PostgreSQL, Tailwind CSS 4. New pages use Server Components. Blog system uses a BlogPost model with admin CRUD + AI draft generation via Claude API. No external dependencies for i18n (simple dictionary approach).

**Tech Stack:** Next.js 16, React 19, Prisma 7, PostgreSQL, Tailwind CSS 4, Stripe, Anthropic SDK (blog AI)

---

## Phase 1: Quick Wins (Trust & Legal)

### Task 1: Add RBQ Number to Footer

**Files:**
- Modify: `src/components/Footer.js`

Add RBQ license number in the footer bottom bar, right after the copyright text.

**Implementation:**
In `Footer.js`, replace the footer bottom `<div>`:
```jsx
<div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/40">
  <span>&copy; {new Date().getFullYear()} Vosthermos. Tous droits reserves.</span>
  <span>RBQ : XXXXX-XXXX-XX | <a href="/politique-confidentialite" className="hover:text-white transition-colors">Politique de confidentialite</a></span>
</div>
```
*Note: Replace XXXXX-XXXX-XX with the actual RBQ number from the client.*

---

### Task 2: Privacy Policy Page (Loi 25)

**Files:**
- Create: `src/app/politique-confidentialite/page.js`

Create a complete privacy policy page compliant with Quebec's Law 25 (Loi sur la protection des renseignements personnels). Include sections on: data collection, cookies, Stripe payments, Google Analytics, chat data, Twilio SMS, data retention, rights of users, contact info for privacy officer.

**SEO:** `noindex` this page (low SEO value).

---

### Task 3: Dedicated Guarantee Page

**Files:**
- Create: `src/app/garantie/page.js`

Full page showcasing the 10-year warranty on thermos, 5-year on labor, transferable guarantee. Include visual timeline, comparison with competitors, FAQ about guarantee claims. Add schema markup `https://schema.org/OfferWarranty`.

---

## Phase 2: Service Pages & Content

### Task 4: Dedicated Service Pages (4 pages)

**Files:**
- Create: `src/app/services/[slug]/page.js` (dynamic route)
- Create: `src/lib/services-data.js` (service definitions with unique content)
- Modify: `src/components/Footer.js` (update service links from `/#services` to `/services/[slug]`)
- Modify: `src/app/page.js` (update service card links)

**4 service slugs:**
1. `/services/remplacement-quincaillerie`
2. `/services/remplacement-vitre-thermos`
3. `/services/reparation-portes-bois`
4. `/services/moustiquaires-sur-mesure`

**Each page includes:**
- Hero with service-specific messaging
- Detailed description of the process (unique per service)
- "What we repair" section with specific items
- Pricing transparency (starting from X$)
- Before/after photos (reuse gallery component)
- FAQ specific to that service (with JSON-LD FAQPage schema)
- CTA to quote form
- Related services links
- JSON-LD Service schema markup

**Content strategy:** Each page has 500+ words of unique content focusing on the specific service. No generic text shared across pages. This is what makes us different from Basco/Solution Thermo who have thin service pages.

---

### Task 5: FAQ Section on Homepage + Dedicated FAQ Page

**Files:**
- Modify: `src/app/page.js` (add visible FAQ section before Contact, the JSON-LD already exists)
- Create: `src/app/faq/page.js` (full FAQ page with 20+ questions)

The homepage already has FAQ JSON-LD schema but no visible FAQ section. Add an accordion-style FAQ section. Create a full `/faq` page with comprehensive questions organized by category (services, pricing, guarantee, process, boutique).

---

### Task 6: Common Problems Section

**Files:**
- Modify: `src/app/page.js` (add section after Services)
- Create: `src/components/ProblemsSection.js`

Educational section with 4 common window/door problems:
1. Condensation/buee entre les vitres (photo + explanation)
2. Difficulte a ouvrir/fermer fenetres (mechanisms)
3. Courants d'air et infiltrations (weatherstripping)
4. Moustiquaire dechiree ou mal ajustee

Each problem has: icon, title, short explanation, "Notre solution" link to relevant service page. This is similar to what Basco/Thermos Sans Buee does but with our own unique approach and tone.

---

## Phase 3: Visual & Trust Elements

### Task 7: Before/After Slider Component

**Files:**
- Create: `src/components/BeforeAfterSlider.js`
- Modify: `src/app/page.js` (add to gallery section or as new section)

Interactive drag slider showing before/after of our work. Pure CSS + minimal JS (no library). Show 3-4 examples: thermos replacement, hardware repair, door restoration, screen repair.

**Implementation:** CSS `clip-path` approach with a draggable divider. Works on mobile (touch) and desktop (mouse).

---

### Task 8: Google Reviews Integration

**Files:**
- Create: `src/components/GoogleReviews.js`
- Modify: `src/app/page.js` (replace hardcoded testimonials section)

**Approach:** Since Google Places API is expensive and complex, we use a hybrid approach:
1. Store real Google reviews in a JSON file (`src/data/google-reviews.json`)
2. Display them with Google branding (Google logo, star rating, "Review on Google" link)
3. Add a "Leave a review" CTA button linking to Google Maps review page
4. Admin can update the JSON file periodically with new reviews

This is what Basco does - they show real Google reviews but from a cached dataset, not live API.

---

### Task 9: Video Section on Homepage

**Files:**
- Modify: `src/app/page.js` (add video section after "Comment ca marche")
- Create: `src/components/VideoSection.js`

Embed a YouTube video or self-hosted video. Section title: "Voyez notre equipe en action". Lazy-loaded iframe for YouTube or `<video>` tag for self-hosted. Thumbnail placeholder until clicked (performance).

*Note: The client needs to provide/create the video. For now, create the section with a placeholder that's easy to swap.*

---

### Task 10: Eco-Responsibility Message

**Files:**
- Modify: `src/app/page.js` (add before CTA section)

Short section highlighting environmental benefits of repair vs replacement:
- "Chaque fenetre reparee = une fenetre de moins au depotoir"
- Stats: X tonnes of glass saved, Y% less waste than replacement
- Positioned as a differentiator (like Basco's "Economie circulaire" but our own voice)

---

## Phase 4: SEO & Geographic

### Task 11: Enhanced Sector Pages with Unique Content

**Files:**
- Modify: `src/lib/cities.js` (add unique content per city)
- Modify: `src/app/secteurs/[ville]/page.js` (render unique content)

Add to each city in `cities.js`:
- `description`: 2-3 sentences unique to that city (mention neighborhoods, landmarks)
- `neighborhoods`: Array of quartiers/sectors within the city
- `population`: Approximate population
- `commonIssues`: Common door/window issues in that area (older buildings, climate, etc.)

This transforms generic city pages into unique, SEO-rich content pages.

---

### Task 12: Enhanced Schema Markup

**Files:**
- Modify: `src/app/layout.js` (enhance LocalBusiness schema)
- Modify: `src/app/services/[slug]/page.js` (Service schema per page)
- Modify: `src/app/garantie/page.js` (OfferWarranty schema)
- Modify: `src/app/page.js` (add HowTo schema for process section)

Add:
- `hasOfferCatalog` to LocalBusiness
- `makesOffer` with service offerings
- `HowTo` schema for the process section
- `Product` schema enhancements on product pages
- `BreadcrumbList` on all pages

---

## Phase 5: Blog System with AI Generation

### Task 13: Blog Database Model

**Files:**
- Modify: `prisma/schema.prisma` (add BlogPost model)
- Run: `npx prisma migrate dev --name add-blog`

```prisma
model BlogPost {
  id          Int      @id @default(autoincrement())
  title       String
  slug        String   @unique
  excerpt     String   @db.Text
  content     String   @db.Text
  coverImage  String?
  category    String   @default("conseils")
  tags        String[] @default([])
  status      String   @default("draft") // draft, pending_review, published
  authorName  String   @default("Vosthermos")
  aiGenerated Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status])
  @@index([publishedAt])
  @@map("blog_posts")
}
```

**Status flow:** `draft` -> `pending_review` -> `published`
- AI creates posts in `pending_review` status
- Admin reviews and publishes (changes to `published`)
- Admin can also create manual drafts

---

### Task 14: Blog Public Pages

**Files:**
- Create: `src/app/blogue/page.js` (blog listing)
- Create: `src/app/blogue/[slug]/page.js` (blog post detail)
- Create: `src/components/BlogCard.js`

**Blog listing page:**
- Grid of blog cards (image, title, excerpt, date, category)
- Category filter (conseils, entretien, guides, nouvelles)
- Pagination
- JSON-LD Blog schema

**Blog detail page:**
- Full article with rich content (HTML from DB)
- Table of contents (auto-generated from headings)
- Related posts sidebar
- Share buttons
- CTA to quote form at bottom
- JSON-LD Article schema with full metadata
- Dynamic OG image

---

### Task 15: Blog Admin CRUD

**Files:**
- Create: `src/app/admin/blogue/page.js` (list all posts)
- Create: `src/app/admin/blogue/[id]/page.js` (edit post)
- Create: `src/app/admin/blogue/nouveau/page.js` (new post)
- Create: `src/components/admin/BlogEditor.js` (rich text editor)
- Create: `src/app/api/admin/blog/route.js` (GET list, POST create)
- Create: `src/app/api/admin/blog/[id]/route.js` (GET, PUT, DELETE)
- Create: `src/app/api/admin/blog/[id]/publish/route.js` (POST publish)
- Modify: `src/components/admin/AdminSidebar.js` (add Blog link)

**Admin features:**
- List posts with status badges (draft/pending/published)
- Rich text editor (use a lightweight editor like TipTap or simple textarea with Markdown)
- Preview before publishing
- Schedule publishing date
- Cover image upload
- Category and tag selection
- SEO fields (meta title, description, slug)
- "Publish" / "Unpublish" actions
- AI generation button (see Task 16)

---

### Task 16: AI Blog Generation System

**Files:**
- Create: `src/app/api/admin/blog/generate/route.js` (AI generation endpoint)
- Create: `src/components/admin/BlogAIGenerator.js` (UI for AI generation)
- Modify: `src/app/admin/blogue/nouveau/page.js` (integrate AI generator)

**How it works:**
1. Admin clicks "Generer avec IA" button in blog admin
2. Can choose a topic or let AI suggest topics based on:
   - Seasonal relevance (winter = thermos, summer = moustiquaires)
   - SEO keywords from competitor analysis
   - Previous posts (avoid duplicates)
3. Backend calls Claude Sonnet API with a carefully crafted prompt
4. AI generates: title, excerpt, full article (1000-1500 words), suggested tags, meta description
5. Post is saved as `pending_review` status
6. Admin reviews, edits if needed, then publishes

**AI Prompt Template:**
```
Tu es un expert en reparation de portes et fenetres au Quebec. Ecris un article de blogue professionnel pour Vosthermos (vosthermos.com), une entreprise specialisee dans le remplacement de vitres thermos, la quincaillerie de portes/fenetres, la reparation de portes en bois et les moustiquaires sur mesure.

Sujet: {topic}

Consignes:
- 1000-1500 mots en francais quebecois professionnel
- Titre accrocheur optimise SEO
- Introduction qui capte l'attention
- Sous-titres H2/H3 clairs
- Conseils pratiques et actionables
- Mention naturelle de nos services (sans etre trop promotionnel)
- Conclusion avec appel a l'action
- Format HTML avec balises semantiques

Ton: professionnel mais accessible, comme un ami expert qui donne des conseils
Zone: Montreal, Rive-Sud, Laval et environs
```

**Weekly Auto-Generation (Cron):**
- Create: `scripts/generate-weekly-blog.js`
- Uses Claude Sonnet API to generate 1 post per week
- Saves as `pending_review`
- Sends notification to admin (email or SMS via Twilio)
- Topics rotate through a predefined list + seasonal relevance
- Run via cron job on server: `0 9 * * 1` (Monday 9 AM)

**Environment Variables needed:**
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

### Task 17: Blog in Sitemap & Navigation

**Files:**
- Modify: `src/app/sitemap.js` (add blog posts)
- Modify: `src/components/Header.js` (add "Blogue" nav link)
- Modify: `src/components/Footer.js` (add blog link)
- Modify: `src/app/page.js` (add "Derniers articles" section before footer)

---

## Phase 6: Advanced Features

### Task 18: Booking/Calendar System

**Files:**
- Modify: `prisma/schema.prisma` (add Appointment model)
- Create: `src/app/rendez-vous/page.js` (public booking page)
- Create: `src/components/BookingCalendar.js`
- Create: `src/app/api/appointments/route.js`
- Create: `src/app/admin/rendez-vous/page.js` (admin view)
- Create: `src/app/api/admin/appointments/route.js`
- Create: `src/app/api/admin/appointments/[id]/route.js`

```prisma
model Appointment {
  id          Int      @id @default(autoincrement())
  name        String
  phone       String
  email       String?
  serviceType String
  date        DateTime @db.Date
  timeSlot    String   // "09:00", "10:00", etc.
  address     String?
  city        String?
  notes       String?  @db.Text
  status      String   @default("pending") // pending, confirmed, completed, cancelled
  createdAt   DateTime @default(now())

  @@unique([date, timeSlot])
  @@index([date])
  @@index([status])
  @@map("appointments")
}
```

**Public booking page:**
- Calendar widget showing available dates (next 30 days)
- Time slots (9h-16h, hourly)
- Service type selection
- Contact info form
- Confirmation by SMS (Twilio)

**Admin view:**
- Calendar view of all appointments
- Status management (confirm, cancel, complete)
- Daily/weekly view

---

### Task 19: English Version (i18n)

**Files:**
- Create: `src/lib/i18n.js` (dictionary-based translations)
- Create: `src/lib/dictionaries/fr.js`
- Create: `src/lib/dictionaries/en.js`
- Modify: `src/app/layout.js` (language context)
- Create: `src/components/LanguageSwitcher.js`
- Modify: `src/components/Header.js` (add language switcher)

**Approach:** Simple dictionary-based i18n without next-intl or other heavy libraries.
- Default locale: `fr`
- Supported: `fr`, `en`
- Language stored in cookie `locale`
- Server components read cookie, client components use context
- Static content translated via dictionary lookup
- Dynamic content (products, blog) stays in French (bilingual later if needed)
- URL structure: same URLs, content changes based on cookie (simpler than /en/ prefix)

**Priority pages for English:**
- Homepage
- Service pages
- Guarantee page
- FAQ
- Contact section

**NOT translated initially:** Blog, product descriptions, admin panel

---

## Execution Order (Recommended)

1. Task 1 (RBQ) - 5 min
2. Task 2 (Privacy) - 30 min
3. Task 3 (Guarantee) - 30 min
4. Task 4 (Service pages) - 2h
5. Task 5 (FAQ) - 1h
6. Task 6 (Common problems) - 45 min
7. Task 7 (Before/after) - 1h
8. Task 8 (Google reviews) - 1h
9. Task 9 (Video section) - 30 min
10. Task 10 (Eco message) - 20 min
11. Task 11 (Sector pages) - 1h
12. Task 12 (Schema markup) - 45 min
13. Task 13 (Blog DB) - 15 min
14. Task 14 (Blog public) - 2h
15. Task 15 (Blog admin) - 3h
16. Task 16 (Blog AI) - 2h
17. Task 17 (Blog nav/sitemap) - 30 min
18. Task 18 (Booking) - 3h
19. Task 19 (English) - 4h

**Total estimated:** ~24h of implementation
