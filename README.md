# Mr Peri’s

A small, photography-led restaurant website built for the £200 starter scope. React + TypeScript + Vite, self-hosted fonts and ordinary CSS. No backend, CMS, accounts, checkout, paid API or animation library.

## Run locally

Requires Node.js 22.12+.

```sh
npm ci
npm run dev
```

Preview: http://127.0.0.1:5173/

```sh
npm run check
npm run build
npm run preview
```

Vercel can import this repository directly. `vercel.json` supplies the Vite framework preset, `npm ci` installation, `npm run build` build command, `dist` output directory and asset caching. Use the repository root as the root directory; no environment variables are needed. The configuration follows [Vercel's file-based configuration documentation](https://vercel.com/docs/project-configuration). Deployment requires the project owner's approval; nothing has been deployed.

## Update the menu

Edit `src/data/menu.json`. The category list is provisional, all item arrays are deliberately empty and the preview is clearly labelled. Remove unavailable categories. Once the owner approves the real menu, set `verified: true` at the menu and approved-category levels, then add actual items with this shape:

```ts
type MenuItem = {
  name: string;
  description?: string;
  price: number; // GBP, numeric, including pence as decimals
  verified: boolean;
};
```

Only verified items inside verified categories are rendered when the menu is approved. No prices, promotions or item descriptions have been invented. Tabs support pointer interaction, Left/Right arrows, Home and End. Prices use GBP formatting automatically.

## Business details and ordering

Edit `src/data/business.json` using owner-approved information:

- `address`: replace `null` with `{ "street": "…", "locality": "…", "postcode": "…", "country": "GB" }`.
- `locationName`: the verified town or area used in the production page title.
- `openingHours`: rows with `days` and `hours` for display, plus `schema` in Schema.org's format, such as `Mo-Fr 12:00-22:00`. These hours are a format example only, **not** this business's hours. Use separate rows for different schedules; use `Su Closed` for a closed day. Confirm bank-holiday treatment directly with the owner.
- `phone`: the approved public restaurant telephone number. It automatically enables location and mobile tap-to-call actions.
- `phoneOrderingConfirmed`: enables a separate phone ordering row only when this service is offered and the phone number exists.
- `directionsUrl`: the exact Google Maps listing/directions URL. Blank fields leave directions disabled. Accepted URLs begin with `https://www.google.…/maps`, `https://google.…/maps`, `https://maps.app.goo.gl/`, or `https://goo.gl/maps`.
- `ordering`: add the exact business-specific HTTPS URL for each approved platform and set its `confirmed` flag to true. Unconfirmed services remain clearly unavailable. Remove services not offered; no checkout is built.
- `socials`: an array of `{ "name": "…", "url": "https://…" }` for genuine profiles.
- `siteUrl`: the confirmed HTTPS domain origin, with no path/query/fragment.

## Preview and publishing

Save the official logo in `public/images/` and set `logoPath` to its path (for example `/images/official-logo.png`) to replace the text wordmark. Set `footerLogoPath` to an official version suitable for the dark footer; a blank value retains its text wordmark. Replace the six WebP photo files in `public/images/` with authorised photos using the same names and widths; update `heroImageAlt` and `menuImageAlt` to describe the real photos. Set `photographyVerified: true` only after permission and image content are confirmed. This removes the illustrative-photo captions. The publication build requires this confirmation.

`publishReady` starts `false`. The preview has `noindex, nofollow`, robots blocking and an empty valid sitemap. No invented canonical URL or address schema is emitted.

Once the verified menu, business details and final images are in place, set `publishReady: true`, run `npm run build` and review before publishing. The build validates essential publication fields, generates a canonical URL and sitemap, allows crawling, and emits Restaurant structured data with verified contact/location/hours. Data is embedded during the build; rebuild after content edits. This flag prepares SEO; it does **not** deploy anything. `npm test` checks the publication gate and generated SEO using isolated fixtures.

The site has one semantic H1, section H2s, image alt text, keyboard navigation, visible focus outlines, a skip link, reduced-motion support and a mobile action bar with safe-area padding. The burger is prioritised; other images lazy-load. All assets are local, so no third-party image/font request is required at runtime.

## Assets to obtain from the owner

1. Official logo in SVG, transparent PNG or the highest-resolution available file. The current text wordmark and initial-based favicon are temporary; they do not reproduce or replace the official chicken logo.
2. The referenced storefront/Google Maps screenshot, which was not attached in this session, for a final brand comparison.
3. Authorised original food photos: a landscape chicken burger or peri-peri hero, chicken/wings detail, and any featured meals. Confirm permission to use and edit them. Avoid photos copied from Maps or delivery platforms.
4. Legible photographs of the entire current menu, including categories, portion sizes, GBP prices, descriptions and any verified meal deals.
5. Exact trading name, full address, town/area, postcode, public phone, opening hours, holiday variations and the correct Google Maps listing.
6. Approved Uber Eats, Deliveroo and/or Just Eat storefront URLs, plus confirmation of whether direct phone orders are accepted.
7. Official social profile URLs and any approved dietary/allergen wording. The site currently directs allergy questions to the restaurant without claiming any certifications.
8. The chosen domain, ownership/access for domain and hosting, and approval of the final site before public deployment.

## Asset provenance

See `ASSETS.md` for image prompts, temporary-asset status and font licensing. This preview does not include analytics, cookies, tracking, forms or a database.
