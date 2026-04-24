# Wikidata Entity Setup for Vosthermos

## Step 1: Create a Wikidata Account

1. Go to https://www.wikidata.org
2. Click "Create account" (top right)
3. Fill in username, password, email
4. Verify your email

## Step 2: Create the Wikidata Entity

1. Go to https://www.wikidata.org/wiki/Special:NewItem
2. Fill in:
   - **Language**: French (fr)
   - **Label**: Vosthermos
   - **Description**: Entreprise quebecoise specialisee en reparation de portes et fenetres
   - **Also known as**: Vos Thermos

3. Click "Create"
4. Note the Q-number assigned (e.g., Q123456789)

## Step 3: Add English Label

1. On the entity page, click "add" next to "In more languages"
2. Add:
   - **Language**: English (en)
   - **Label**: Vosthermos
   - **Description**: Quebec-based company specializing in door and window repair

## Step 4: Add Properties (Statements)

Add each of the following statements by clicking "+ add statement":

### Core Identity

| Property | Property ID | Value |
|----------|-------------|-------|
| Instance of | P31 | business enterprise (Q4830453) |
| Country | P17 | Canada (Q16) |
| Located in administrative entity | P131 | Quebec (Q176) |
| Industry | P452 | construction (Q385378) |
| Legal form | P1454 | sole proprietorship (Q6547519) or small business (Q2915849) |

### Contact & Location

| Property | Property ID | Value |
|----------|-------------|-------|
| Official website | P856 | https://www.vosthermos.com |
| Email address | P968 | info@vosthermos.com |
| Phone number | P1329 | +1-514-825-8411 |
| Street address | P6375 | 330 Ch. St-Francois-Xavier, Local 104 |
| Postal code | P281 | J5B 1C9 |
| Coordinate location | P625 | 45.371, -73.457 |

### Branding

| Property | Property ID | Value |
|----------|-------------|-------|
| Logo image | P154 | Upload logo to Wikimedia Commons first, then link |
| Image | P18 | Upload a photo of the business/storefront to Wikimedia Commons |

### Timeline

| Property | Property ID | Value |
|----------|-------------|-------|
| Inception | P571 | 2010 |

### Online Presence

| Property | Property ID | Value |
|----------|-------------|-------|
| Facebook profile ID | P2013 | 61562303553558 |
| Instagram username | P2003 | vosthermos |

### Identifiers

| Property | Property ID | Value |
|----------|-------------|-------|
| RBQ license | Add as external ID if available, or use P3225 (identifier) | 5790-9498-01 |

## Step 5: Upload Logo to Wikimedia Commons

1. Go to https://commons.wikimedia.org/wiki/Special:Upload
2. Upload the logo file (Vos-Thermos-Logo.png)
3. Set:
   - **Filename**: Vosthermos_Logo.png
   - **Description**: Logo of Vosthermos, a Quebec door and window repair company
   - **License**: Select the appropriate license (e.g., fair use for logos, or public domain if applicable)
4. After upload, go back to the Wikidata entity and add it as P154 (logo image)

## Step 6: Add sameAs URLs

On the Wikidata entity page, the following are automatically linked via properties:
- P856 (official website) links to https://www.vosthermos.com
- P2013 (Facebook) links to the Facebook profile
- P2003 (Instagram) links to the Instagram profile

## Step 7: Update Website Schema (layout.js)

After creating the entity and obtaining the Q-number, update the `sameAs` array in `src/app/layout.js`:

Replace `Q_PLACEHOLDER` with the actual Q-number in this line:
```js
"https://www.wikidata.org/wiki/Q_PLACEHOLDER"
```

For example, if the Q-number is Q123456789:
```js
sameAs: [
  "https://www.facebook.com/profile.php?id=61562303553558",
  "https://instagram.com/vosthermos/",
  "https://www.wikidata.org/wiki/Q123456789",
],
```

## Step 8: Verify

1. Wait 24-48 hours for Wikidata to propagate
2. Search "Vosthermos" on Google Knowledge Panel — it may start appearing
3. Verify the entity at https://www.wikidata.org/wiki/Q_YOUR_NUMBER
4. Test schema validation at https://validator.schema.org/ with vosthermos.com

## Notes

- Wikidata entities for businesses are acceptable as long as the business meets notability guidelines (has been covered by independent sources)
- If the entity is flagged for deletion, add references (citations from news articles, directories, etc.)
- Consider adding the Google Maps Place ID as P3749 once available
- The Wikidata URL in sameAs helps Google's Knowledge Graph connect your website to structured data
