# CLAUDE.md - Vosthermos Website

## Project Overview

**Vosthermos** is a professional business website for a door and window repair company based in Saint-Francois-Xavier, Quebec, Canada. The site is a static single-page application (SPA) with horizontal scrolling sections, built with vanilla HTML, CSS, and JavaScript, deployed on Netlify.

**Primary Language**: French (with English translation support)

**Live Deployment**: Hosted on Netlify with automatic deployments from the main branch.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure |
| CSS3 | Styling (custom properties, flexbox, grid) |
| Vanilla JavaScript | Interactivity and navigation |
| Netlify | Hosting and deployment |
| Netlify CMS | Content management (images) |
| CallMeBot API | WhatsApp contact form integration |
| Font Awesome 6 | Icons |
| Google Fonts (Montserrat) | Typography |

---

## Directory Structure

```
Vosthermos/
├── index.html              # Main single-page website
├── merci.html              # Thank you page (after form submission)
├── user.html               # User login page
├── admin-dashboard.html    # Admin dashboard
├── send-email.php          # Legacy email handler (unused)
├── netlify.toml            # Netlify deployment config
├── _headers                # HTTP headers for videos
├── .gitignore              # Git ignore rules
├── README.md               # Project documentation
│
├── css/
│   ├── styles.css          # Main styles + CSS custom properties
│   ├── responsive.css      # Media queries for responsiveness
│   ├── serve-fix.css       # Development server fixes
│   ├── animations.css      # Animation keyframes
│   └── reviews.css         # Customer reviews styling
│
├── js/
│   ├── script.js           # Main navigation and UI interactions
│   ├── email.js            # Contact form (WhatsApp API)
│   ├── language.js         # i18n translation system
│   ├── reviews-animation.js # Customer reviews animation
│   ├── cms-integration.js  # Netlify CMS integration
│   ├── desktop-fix.js      # Desktop-specific fixes
│   ├── direct-nav.js       # Direct navigation helper
│   └── nav-fix.js          # Navigation fixes
│
├── images/
│   ├── accueil/            # Home section images
│   ├── quincaillerie/      # Hardware section images
│   ├── vitre-thermos/      # Thermo glass section images
│   ├── portes-bois/        # Wooden doors section images
│   ├── moustiquaires/      # Screens section images
│   └── *.jpg, *.png        # Logo and misc images
│
├── videos/
│   └── vosthermos-background.mp4  # Background video
│
├── admin/
│   ├── index.html          # Netlify CMS admin panel
│   ├── config.yml          # CMS collections configuration
│   ├── .htaccess           # Apache access rules
│   └── .htpasswd           # Password protection
│
├── _data/
│   └── images/             # JSON files for CMS image management
│       ├── accueil.json
│       ├── services.json
│       ├── galerie.json
│       └── ...
│
└── pages/
    ├── 404.html            # Not found page
    ├── login.html          # Alternative login
    ├── admin.html          # Admin redirect
    └── ...
```

---

## Main Website Sections (index.html)

The website uses **horizontal scrolling navigation** with 6 main sections:

| # | Section ID | Purpose |
|---|------------|---------|
| 1 | `#accueil` | Home - Company presentation with video background |
| 2 | `#quincaillerie` | Hardware replacement services |
| 3 | `#vitre-thermos` | Thermo glass replacement services |
| 4 | `#portes-bois` | Wooden door repair services |
| 5 | `#moustiquaires` | Screen repair/fabrication services |
| 6 | `#contact` | Contact form and company info |

---

## CSS Architecture

### Custom Properties (defined in `css/styles.css`)

```css
:root {
    --primary-color: #e30718;      /* Red (logo/accent) */
    --secondary-color: #003845;    /* Teal/dark blue (background) */
    --accent-color: #ffffff;       /* White */
    --text-color: #e30718;         /* Red for text */
}
```

### Key CSS Classes

| Class | Purpose |
|-------|---------|
| `.home-roll-item` | Each horizontal section |
| `.roll-content-w` | Content wrapper (scrollable vertically) |
| `.roll-cont-he` | Section headings |
| `.gallery-grid-horizontal` | Image gallery grid |
| `.nav-dot` | Navigation dot buttons |
| `.explore-btn-w` | CTA button styling |
| `.lightbox-overlay` | Lightbox for images |

---

## JavaScript Architecture

### script.js - Main Navigation

**Key Functions:**
- `scrollToSlide(index)` - Navigate to a specific section
- `performSlideTransition(index)` - Execute slide animation
- `navigateSlide(direction)` - Move prev/next
- `resetContactScrollIfNeeded(callback)` - Reset contact section scroll
- `setupLightbox()` - Initialize image lightbox

**Navigation Methods:**
- Navigation dots (bottom center)
- Menu overlay links
- Swipe gestures (mobile)
- Keyboard arrows
- Mouse wheel

**Global Variables:**
- `window.isAnimating` - Animation lock flag
- `currentSlide` - Current section index

### email.js - Contact Form

Sends form data to WhatsApp via CallMeBot API:
- Primary number: `15145695583` (API key: `9107923`)
- Secondary number: `15148258411` (API key: `1752086`)

### language.js - Internationalization

Uses `data-i18n` attributes for translations:
```html
<h2 data-i18n="PORTES ET FENÊTRES">PORTES ET FENÊTRES</h2>
```

Language is stored in `localStorage` under key `vosthermosLang`.

---

## Netlify Configuration

### netlify.toml

```toml
[build]
  publish = "."        # Root directory
  command = ""         # No build command (static site)

[[redirects]]
  from = "/admin/*"
  to = "/admin/index.html"
  status = 200
```

### Netlify CMS (admin/config.yml)

- Backend: `git-gateway`
- Branch: `main`
- Media folder: `images/`
- Collections: Section images managed via JSON files in `_data/images/`

---

## Development Guidelines

### File Naming Conventions

- **HTML**: lowercase, hyphen-separated (`admin-dashboard.html`)
- **CSS**: lowercase, hyphen-separated (`serve-fix.css`)
- **JS**: lowercase, hyphen-separated (`reviews-animation.js`)
- **Images**: Use descriptive names with category prefix

### Code Style

- **CSS**: Use CSS custom properties for colors
- **JavaScript**: Use `document.addEventListener('DOMContentLoaded', ...)` for initialization
- **HTML**: Use `data-*` attributes for JavaScript hooks
- **i18n**: Add `data-i18n` attribute with French text as key

### Adding New Content

1. **New Section Image**: Add to appropriate `images/` subdirectory
2. **New Translation**: Add entry to `translations` object in `js/language.js`
3. **New CSS**: Prefer extending existing classes; add responsive styles

### Testing Locally

No build process required. Serve with any static file server:
```bash
npx serve .
# or
python -m http.server 8000
```

---

## Important Conventions

### Navigation

- Sections use `data-roll="item"` attribute
- Navigation dots auto-generated from `.home-roll-item` elements
- Active section has `.active` class
- Horizontal translation via CSS `transform: translateX()`

### Contact Form

- Form ID: `contactForm`
- Submit button ID: `submitButton`
- Status display ID: `formStatus`
- Messages sent via WhatsApp API (fire-and-forget pattern)

### Responsive Breakpoints

```css
@media (max-width: 1200px) { /* Tablet landscape */ }
@media (max-width: 992px)  { /* Tablet portrait */ }
@media (max-width: 768px)  { /* Mobile */ }
@media (max-width: 480px)  { /* Small mobile */ }
@media (max-height: 500px) and (orientation: landscape) { /* Landscape mobile */ }
```

---

## Security Notes

- User authentication uses simple password check (`user.html` -> `admin-dashboard.html`)
- Session stored in `sessionStorage` (key: `authenticated`)
- API keys for CallMeBot are exposed in client-side code (acceptable for this use case)
- Admin area protected by `.htpasswd` (Apache-based)

---

## Deployment

1. Push changes to `main` branch
2. Netlify automatically deploys from GitHub
3. CMS changes commit directly to repository

### Git Workflow

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

---

## Common Tasks

### Update Contact Phone Numbers

Edit `js/email.js`:
```javascript
const whatsappNumber1 = '15145695583';  // Line 42
const whatsappNumber2 = '15148258411';  // Line 45
```

### Add New Gallery Images

1. Add images to appropriate `images/` subdirectory
2. Add `<div class="gallery-item">` elements in `index.html`
3. Follow existing naming pattern: `reparation-1.jpg`, `entretien-1.jpg`, etc.

### Update Translations

Edit `js/language.js` and add entries to `translations.en` object:
```javascript
translations.en["French text"] = "English text";
```

---

## External Dependencies (CDN)

- Font Awesome 6.0.0: `cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css`
- Google Fonts (Montserrat): `fonts.googleapis.com`
- EmailJS (optional): `cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js`
