import { readFile, writeFile } from "node:fs/promises";

const business = JSON.parse(
  await readFile(new URL("../src/data/business.json", import.meta.url), "utf8"),
);
const root = new URL("../dist/", import.meta.url);
let html = await readFile(new URL("index.html", root), "utf8");
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
if (business.publishReady) {
  if (!business.photographyVerified)
    throw new Error(
      "Replace the illustrative photos with authorised business photography before publishing.",
    );
  const url = new URL(business.siteUrl);
  if (
    url.protocol !== "https:" ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error("Use a confirmed HTTPS homepage origin for siteUrl.");
  if (
    !business.address ||
    !["street", "locality", "postcode", "country"].every(
      (field) =>
        typeof business.address[field] === "string" &&
        business.address[field].trim(),
    ) ||
    !business.phone ||
    !business.directionsUrl ||
    !business.openingHours.length ||
    !business.locationName
  )
    throw new Error(
      "Publishing requires verified address, phone, directions, opening hours and location name.",
    );
  if (
    !business.openingHours.every(
      (day) =>
        typeof day.schema === "string" &&
        /^(Mo|Tu|We|Th|Fr|Sa|Su)(-(Mo|Tu|We|Th|Fr|Sa|Su))? (\d{2}:\d{2}-\d{2}:\d{2}|Closed)$/.test(
          day.schema,
        ),
    )
  )
    throw new Error(
      "Each opening-hours row needs a valid Schema.org openingHours string.",
    );
  const menu = JSON.parse(
    await readFile(new URL("../src/data/menu.json", import.meta.url), "utf8"),
  );
  if (
    !menu.verified ||
    !menu.categories.some((c) => c.verified && c.items.some((i) => i.verified))
  )
    throw new Error("Publishing requires a verified menu.");
  if (
    menu.categories.some((c) =>
      c.items.some(
        (i) =>
          i.verified &&
          (!i.name ||
            typeof i.price !== "number" ||
            !Number.isFinite(i.price) ||
            i.price < 0),
      ),
    )
  )
    throw new Error(
      "Verified menu items must have a name and valid GBP price.",
    );
  const origin = url.origin;
  const title = `${business.name} ${business.locationName} — Chicken, Burgers & More`;
  const description = `${business.name} in ${business.locationName}. Freshly prepared peri-peri chicken, burgers, wraps and wings. Explore our menu, ordering options, opening hours and directions.`;
  html = html
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${escape(description)}$2`,
    )
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
      `$1${escape(title)}$2`,
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
      `$1${escape(description)}$2`,
    )
    .replace('content="noindex, nofollow"', 'content="index, follow"');
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: business.name,
    url: origin + "/",
    telephone: business.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: business.address.locality,
      postalCode: business.address.postcode,
      addressCountry: business.address.country,
    },
    openingHours: business.openingHours
      .map((day) => day.schema)
      .filter((s) => !s.endsWith("Closed")),
    servesCuisine: ["Chicken", "Peri-peri"],
    hasMenu: `${origin}/#menu`,
    sameAs: business.socials
      .map((s) => s.url)
      .filter((s) => s.startsWith("https://")),
  };
  html = html.replace(
    "</head>",
    `<link rel="canonical" href="${escape(origin)}/" /><meta property="og:url" content="${escape(origin)}/" /><meta property="og:image" content="${escape(origin)}/images/hero-burger-1280.webp" /><meta property="og:image:alt" content="${escape(business.heroImageAlt)}" /><script type="application/ld+json">${safeJson(schema)}</script></head>`,
  );
  await writeFile(
    new URL("robots.txt", root),
    `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
  );
  await writeFile(
    new URL("sitemap.xml", root),
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(origin)}/</loc></url></urlset>`,
  );
} else {
  // No invented domain, address or Restaurant schema in the design preview.
  await writeFile(
    new URL("sitemap.xml", root),
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
  );
}
await writeFile(new URL("index.html", root), html);
console.log(
  business.publishReady
    ? "Verified SEO, canonical, sitemap and Restaurant schema generated."
    : "Preview SEO generated. Search indexing disabled until business details are verified.",
);
