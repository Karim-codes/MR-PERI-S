import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  copyFile,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

// Test data lives only in isolated temporary fixtures, never the restaurant site.
async function fixture(overrides = {}, approvedMenu = false) {
  const dir = await mkdtemp(join(tmpdir(), "mr-peris-seo-"));
  await Promise.all([
    mkdir(join(dir, "src/data"), { recursive: true }),
    mkdir(join(dir, "dist")),
    mkdir(join(dir, "scripts")),
  ]);
  const business = JSON.parse(
    await readFile(
      new URL("../src/data/business.json", import.meta.url),
      "utf8",
    ),
  );
  await copyFile(
    new URL("generate-seo.mjs", import.meta.url),
    join(dir, "scripts/generate-seo.mjs"),
  );
  await copyFile(
    new URL("../index.html", import.meta.url),
    join(dir, "dist/index.html"),
  );
  await copyFile(
    new URL("../public/robots.txt", import.meta.url),
    join(dir, "dist/robots.txt"),
  );
  await writeFile(
    join(dir, "src/data/business.json"),
    JSON.stringify({ ...business, ...overrides }),
  );
  await writeFile(
    join(dir, "src/data/menu.json"),
    JSON.stringify({
      verified: approvedMenu,
      categories: [
        {
          verified: approvedMenu,
          items: approvedMenu
            ? [{ name: "Test fixture only", price: 1, verified: true }]
            : [],
        },
      ],
    }),
  );
  return {
    dir,
    run: () =>
      execFileSync(process.execPath, [join(dir, "scripts/generate-seo.mjs")], {
        stdio: "pipe",
      }),
    read: (name) => readFile(join(dir, "dist", name), "utf8"),
  };
}

test("preview stays unindexed and contains no invented canonical or restaurant data", async () => {
  const f = await fixture();
  try {
    f.run();
    const html = await f.read("index.html");
    assert.match(html, /noindex, nofollow/);
    assert.doesNotMatch(html, /rel="canonical"|application\/ld\+json/);
    assert.match(await f.read("robots.txt"), /Disallow: \//);
    assert.doesNotMatch(await f.read("sitemap.xml"), /<loc>/);
  } finally {
    await rm(f.dir, { recursive: true, force: true });
  }
});

test("publication is blocked when business details are missing", async () => {
  const f = await fixture({
    publishReady: true,
    photographyVerified: true,
    siteUrl: "https://example.test",
  });
  try {
    assert.throws(f.run, /Publishing requires verified address/);
  } finally {
    await rm(f.dir, { recursive: true, force: true });
  }
});

const verifiedFixture = {
  publishReady: true,
  photographyVerified: true,
  siteUrl: "https://example.test",
  name: "Test restaurant",
  locationName: "Test area",
  address: {
    street: "Test street",
    locality: "Test area",
    postcode: "Test postcode",
    country: "GB",
  },
  phone: "+440000000000",
  directionsUrl: "https://www.google.com/maps",
  openingHours: [
    { days: "Test only", hours: "Test only", schema: "Mo-Fr 12:00-22:00" },
  ],
};

test("publication is blocked without a verified menu", async () => {
  const f = await fixture(verifiedFixture);
  try {
    assert.throws(f.run, /Publishing requires a verified menu/);
  } finally {
    await rm(f.dir, { recursive: true, force: true });
  }
});

test("verified publication produces matching local SEO, sitemap and structured data", async () => {
  const f = await fixture(verifiedFixture, true);
  try {
    f.run();
    const html = await f.read("index.html");
    assert.match(html, /content="index, follow"/);
    assert.match(html, /<title>Test restaurant Test area/);
    assert.match(html, /Test restaurant in Test area/);
    assert.match(html, /rel="canonical" href="https:\/\/example.test\/"/);
    const schema = JSON.parse(
      html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1],
    );
    assert.equal(schema["@type"], "Restaurant");
    assert.equal(schema.address.addressLocality, "Test area");
    assert.deepEqual(schema.openingHours, ["Mo-Fr 12:00-22:00"]);
    assert.match(await f.read("robots.txt"), /Allow: \//);
    assert.match(
      await f.read("sitemap.xml"),
      /<loc>https:\/\/example.test\/<\/loc>/,
    );
  } finally {
    await rm(f.dir, { recursive: true, force: true });
  }
});
