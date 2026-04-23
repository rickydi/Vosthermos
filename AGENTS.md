<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Vosthermos — contexte projet

## Deploy
- **Toujours utiliser** `bash scripts/deploy-safe.sh` (zéro downtime, build dans `.next.new` puis swap atomique).
- PM2 app: `vosthermos` sur port 3002, 1 instance cluster mode.
- VPS: `ssh -i ~/.ssh/id_ed25519 -p 2243 root@67.215.11.55`, path `/home/vosthermo/vosthermos_app`.
- Production URL: https://www.vosthermos.com

## Stack
- Next.js 16 (App Router, webpack mode), React 19, Tailwind 4, Prisma 7 + adapter-pg, PostgreSQL, nodemailer SMTP.
- Auth admin: session cookie custom via `src/lib/admin-auth.js` (`requireAdmin()`).
- Fonts: Montserrat via Google Fonts CDN, Font Awesome 6 icons.

## B2B Portal (`/gestionnaire`)

### Structure
```
Gestionnaire (ManagerUser)
 └─ Copropriétés (Client type=gestionnaire, m2m via ManagerClient)
    ├─ Bâtiments (Building, clientId, code, name)
    │  └─ Unités (ClientUnit, buildingId, code)
    │     └─ Ouvertures (UnitOpening: fenêtre/porte/porte-patio avec photo)
    └─ Bons de travail (WorkOrder) — sert aussi de facture via statut
```

### Auth
- Magic link par email (token 15 min, session cookie 30 jours, table `manager_sessions`).
- Helpers: `src/lib/manager-auth.js` → `getManagerFromCookie()`, `canAccessClient()`, `hasPermission()`.
- Login: `/gestionnaire/login` → POST `/api/manager/auth/send-link` → email → clic → `/api/manager/auth/verify` → session.
- Admin peut impersonate: POST `/api/admin/managers/[id]?action=impersonate` (crée session manager).

### Permissions (par ManagerClient, array)
`view_work_orders`, `view_invoices`, `view_quotes`, `request_intervention`, `approve_quotes`, `manage_units`, `manage_openings`.

### Routes API manager
- `POST /api/manager/clients` — créer copro (auto-lie manager avec toutes perms)
- `POST /api/manager/buildings` · `PUT/DELETE /api/manager/buildings/[id]` (perm `manage_units`)
- `POST /api/manager/units` · `PUT/DELETE /api/manager/units/[id]` (perm `manage_units`, soft delete)
- `POST /api/manager/openings` · `PUT/DELETE /api/manager/openings/[id]` (perm `manage_openings`, multipart/form-data pour photos)
- `GET /api/manager/tree` — arbre complet pour cascades (clients → buildings → units → openings)
- `POST /api/manager/intervention-requests` — crée WorkOrder statut=draft + email admin

### Routes API admin
- `/api/admin/managers` · `/api/admin/managers/[id]` (CRUD + impersonate)
- `/api/admin/buildings` · `/api/admin/buildings/[id]`
- `/api/admin/units` · `/api/admin/units/[id]`
- `/api/admin/openings` · `/api/admin/openings/[id]`

### Pages clés
- `/gestionnaire/login` — magic link entry
- `/gestionnaire` — dashboard avec sidebar (syndicats) + onglets (Dashboard/Interventions/Factures/Plan/Documents/Paramètres), modal unité avec ouvertures
- `/admin/gestionnaires` — liste gestionnaires + inviter + impersonate
- `/admin/gestionnaires/[id]` — profil + permissions par client + sessions
- `/admin/clients/[id]` — onglets Bâtiments & Unités (avec modal ouvertures)

### Styles
- Portail gestionnaire CSS séparé: `src/app/gestionnaire/gestionnaire.css`
- Header/Footer/Chat/PromoBanner **masqués** sur `/gestionnaire/*` (voir `ConditionalFooter`, `Header`, `ChatBubble`, `PromoBanner`)
- Modal commun: composant `<ModalShell>` dans `GestionnaireDashboard.js` (gère Escape, body scroll lock, z-index stacking level 1/2/3)
- Classes form: `.gm-field`, `.gm-form`, `.gm-form-actions`, `.gm-dropzone` (photo drag-drop)

### Uploads photos
- Stockage local VPS: `public/uploads/openings/`
- Helper: `src/lib/upload-photo.js` → `savePhotoFromFormData()`, `deletePhotoFile()`
- Max 8 MB, formats JPEG/PNG/WebP/GIF
- URLs publiques: `/uploads/openings/<filename>`

### Test data
- Manager test: `lastb525@gmail.com` (Yannis D'Almeida test)
- Client test: "Syndicat Le Marronnier" (Laval) id=57, 4 bâtiments (A/B/C/D), 18 unités
- Seed: `scripts/seed-marronnier.mjs`

## Company info centralisé
- Source vérité: table `site_settings` (DB) éditable via `/admin/parametres`
- Lecture runtime: `src/lib/company.js` → `getCompany()` (async, server only)
- Constante statique: `src/lib/company-info.js` → `COMPANY_INFO` (build-time, synchronisée via bouton "Propager sur le site")
- **Règle**: ne jamais hardcoder NAP. Importer `COMPANY_INFO` (client-safe) ou `getCompany()` (server).

## SEO
- Sitemap dynamique: `src/app/sitemap.js` (~1600 URLs)
- IndexNow configuré (Bing/Yandex): `src/lib/indexnow.js` + `/api/indexnow` (mode="all" ping toutes URLs)
- GSC + Bing Webmaster + Yandex configurés
- Conformité Loi 25: hébergement Canada + chiffrement SSL
