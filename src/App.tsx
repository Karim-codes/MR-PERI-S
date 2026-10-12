import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import business from "./data/business.json";
import menuData from "./data/menu.json";

type MenuItem = {
  name: string;
  description?: string;
  price: number;
  verified: boolean;
};
type Category = {
  id: string;
  name: string;
  verified: boolean;
  items: MenuItem[];
};
type Social = { name: string; url: string };
type Hours = { days: string; hours: string; schema?: string };
type Address = {
  street: string;
  locality: string;
  postcode: string;
  country: string;
};

function Icon({
  name = "arrow",
  className = "",
}: {
  name?: string;
  className?: string;
}) {
  const paths: Record<string, ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    external: (
      <>
        <path d="M7 17 17 7M7 7h10v10" />
      </>
    ),
    down: (
      <>
        <path d="M12 4v16M6 14l6 6 6-6" />
      </>
    ),
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    phone: (
      <path d="m5 3 4 1 1 5-3 2a14 14 0 0 0 6 6l2-3 5 1 1 4c-1 3-6 2-10-1S2 7 5 3Z" />
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M6 18 18 6" />
      </>
    ),
    flame: (
      <path d="M12 2c2 5 0 5 3 8 1-2 2-3 2-3 6 6 4 15-5 15S1 14 6 8c0 4 3 4 3 4-2-5 3-7 3-10Z" />
    ),
  };
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.arrow}
    </svg>
  );
}

function Brand({ footer = false }: { footer?: boolean }) {
  const logoPath = footer ? business.footerLogoPath : business.logoPath;
  return (
    <a
      className={`brand ${footer ? "brand-footer" : ""}`}
      href="#home"
      aria-label="Mr Peri's home"
    >
      {logoPath ? (
        <img
          className="official-logo"
          src={logoPath}
          alt={business.name}
          width="175"
          height="56"
        />
      ) : (
        <>
          <span>
            Mr Peri’s<span className="brand-dot">.</span>
          </span>
          <small>SIMPLY DELICIOUS</small>
        </>
      )}
    </a>
  );
}

function FoodImage({
  type,
  className = "",
  priority = false,
}: {
  type: "hero-burger" | "peri-chicken";
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      className={className}
      src={`/images/${type}-1280.webp`}
      srcSet={`/images/${type}-768.webp 768w, /images/${type}-1280.webp 1280w, /images/${type}-1920.webp 1920w`}
      sizes={
        type === "hero-burger"
          ? "(max-width: 700px) 100vw, 75vw"
          : "(max-width: 700px) 100vw, 50vw"
      }
      alt={
        type === "hero-burger" ? business.heroImageAlt : business.menuImageAlt
      }
      width="1536"
      height="1024"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

function App() {
  const categories = (menuData.categories as Category[]).filter(
    (c) => !menuData.verified || c.verified,
  );
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [navOpen, setNavOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const currentCategory =
    categories.find((c) => c.id === categoryId) || categories[0];
  const items =
    menuData.verified && currentCategory?.verified
      ? currentCategory.items.filter((i) => i.verified)
      : [];
  const ordering = business.ordering.filter(
    (p) => p.confirmed && /^https:\/\//.test(p.url),
  );
  const phone = business.phone;
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, "")}`;
  const address = business.address as Address | null;
  const hours = business.openingHours as Hours[];
  const socials = business.socials as Social[];
  const directions =
    /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.app\.goo\.gl\/|goo\.gl\/maps)/.test(
      business.directionsUrl,
    )
      ? business.directionsUrl
      : "";

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (heroRef.current && window.scrollY < heroRef.current.offsetHeight)
          heroRef.current.style.setProperty(
            "--parallax",
            `${Math.min(window.scrollY * 0.065, 38)}px`,
          );
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  function handleTabKey(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % categories.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + categories.length) % categories.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = categories.length - 1;
    else return;
    event.preventDefault();
    setCategoryId(categories[next].id);
    document.getElementById(`tab-${categories[next].id}`)?.focus();
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav
            className={`desktop-nav ${navOpen ? "is-open" : ""}`}
            aria-label="Main navigation"
            id="main-navigation"
          >
            {[
              ["Our menu", "#menu"],
              ["Our story", "#story"],
              ["Find us", "#location"],
            ].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setNavOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
          <a className="button header-order" href="#order">
            Order now <Icon name="external" />
          </a>
          <button
            className="nav-toggle"
            aria-label={navOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={navOpen}
            aria-controls="main-navigation"
            onClick={() => setNavOpen(!navOpen)}
          >
            <Icon name={navOpen ? "close" : "menu"} />
          </button>
        </div>
      </header>
      <main id="main">
        <section
          className="hero"
          id="home"
          ref={heroRef}
          aria-labelledby="hero-heading"
        >
          <div className="hero-photo">
            <FoodImage type="hero-burger" priority />
          </div>
          <div className="hero-shade" />
          <div className="hero-content wrap">
            <p className="eyebrow hero-eyebrow">
              <span className="red-line" /> YOUR NEXT FAVOURITE BITE.
            </p>
            <h1 id="hero-heading">
              <span>SIMPLY</span>
              <span>
                DELICIOUS<span className="red-period">.</span>
              </span>
            </h1>
            <p className="hero-copy">
              Big flavour. Freshly prepared.
              <br />
              Your favourite chicken, burgers and more.
            </p>
            <div className="hero-actions">
              <a className="button button-red" href="#menu">
                Explore our menu <Icon />
              </a>
              <a className="hero-secondary" href="#order">
                Order now <Icon name="external" />
              </a>
            </div>
          </div>
          <div className="flavour-stamp" aria-label="Big on flavour">
            <Icon name="flame" />
            <span>
              BIG ON
              <br />
              FLAVOUR
            </span>
            <small>MR PERI’S</small>
          </div>
          <div className="hero-bottom wrap">
            <a href="#menu">
              <Icon name="down" /> A LITTLE SCROLL. A LOT OF FLAVOUR.
            </a>
            {!business.photographyVerified && (
              <span className="photo-note">
                Illustrative photo · not our food
              </span>
            )}
          </div>
        </section>
        <div className="food-ribbon" aria-hidden="true">
          <div>
            CHICKEN <span /> BURGERS <span /> WRAPS <span /> WINGS <span /> BIG
            FLAVOUR <span /> CHICKEN <span /> BURGERS <span /> WRAPS <span />
          </div>
        </div>

        <section
          className="menu-section section-space wrap"
          id="menu"
          aria-labelledby="menu-heading"
        >
          <div className="section-heading reveal">
            <div>
              <p className="eyebrow">
                <span className="section-number">01 /</span> THE MENU
              </p>
              <h2 id="menu-heading">
                GOOD FOOD.
                <br />
                <span className="text-red">GREAT MOOD.</span>
              </h2>
            </div>
            <div className="heading-side">
              <p>
                Chicken, burgers, wraps and more.
                <br />
                Find your next favourite.
              </p>
              {!menuData.verified && (
                <span className="status-label">
                  MENU PREVIEW · AWAITING CONFIRMATION
                </span>
              )}
            </div>
          </div>
          <div
            className="menu-tabs"
            role="tablist"
            aria-label="Food categories"
          >
            {categories.map((category, index) => (
              <button
                key={category.id}
                id={`tab-${category.id}`}
                role="tab"
                aria-selected={categoryId === category.id}
                aria-controls="menu-panel"
                tabIndex={categoryId === category.id ? 0 : -1}
                onClick={() => setCategoryId(category.id)}
                onKeyDown={(e) => handleTabKey(e, index)}
              >
                {category.name}
                <span>{String(index + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
          <div className="menu-feature reveal">
            <figure className="menu-photo">
              <FoodImage
                type={categoryId === "burgers" ? "hero-burger" : "peri-chicken"}
              />
              <figcaption>
                THE FLAVOUR STARTS HERE.
                <span>
                  {business.photographyVerified
                    ? "MR PERI’S · SIMPLY DELICIOUS"
                    : "Illustrative photography"}
                </span>
              </figcaption>
            </figure>
            <div
              className="menu-panel"
              id="menu-panel"
              role="tabpanel"
              aria-labelledby={`tab-${currentCategory?.id}`}
              tabIndex={0}
            >
              <div key={categoryId} className="menu-panel-content">
                <p className="eyebrow">
                  {String(
                    categories.findIndex((c) => c.id === categoryId) + 1,
                  ).padStart(2, "0")}{" "}
                  /{" "}
                  {menuData.verified
                    ? "EXPLORE THE MENU"
                    : "PROVISIONAL CATEGORY"}
                </p>
                <h3>
                  {currentCategory?.name || "Our menu"}
                  <span className="text-red">.</span>
                </h3>
                {items.length ? (
                  <div className="menu-items">
                    {items.map((item) => (
                      <article key={item.name} className="menu-item">
                        <div>
                          <h4>{item.name}</h4>
                          {item.description && <p>{item.description}</p>}
                        </div>
                        <span className="menu-price">
                          {new Intl.NumberFormat("en-GB", {
                            style: "currency",
                            currency: "GBP",
                          }).format(item.price)}
                        </span>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="menu-pending">
                    <div className="fine-rule" />
                    <p className="menu-pending-title">
                      Something good is on its way.
                    </p>
                    <p>
                      The full {currentCategory?.name.toLowerCase() || ""} menu
                      and prices will be added once confirmed by Mr Peri’s.
                    </p>
                    <p className="small-note">
                      No sample items. No made-up prices.
                      <br />
                      Just a little space for the real thing.
                    </p>
                  </div>
                )}
                <a className="text-link" href="#order">
                  Ready when you are <Icon />
                </a>
              </div>
            </div>
          </div>
          <p className="allergy-note">
            Food allergies or dietary requirements? Please speak to the
            restaurant before ordering.
          </p>
        </section>

        <section
          className="story-section"
          id="story"
          aria-labelledby="story-heading"
        >
          <div className="story-inner wrap reveal">
            <div className="story-mark" aria-hidden="true">
              <Icon name="flame" />
              <span>
                ALL ABOUT
                <br />
                THE FLAVOUR.
              </span>
            </div>
            <div className="story-copy">
              <p className="eyebrow">
                <span className="section-number">02 /</span> THIS IS MR PERI’S
              </p>
              <h2 id="story-heading">
                YOUR LOCAL.
                <br />
                YOUR FAVOURITE.
              </h2>
              <p>
                We’re an independent chicken takeaway and eat in, with a simple
                idea: big flavour, freshly prepared.
              </p>
              <p>
                From peri-peri chicken to burgers, wraps and wings — good food
                is what we’re here for.
              </p>
              <a className="text-link" href="#location">
                Come find us <Icon />
              </a>
            </div>
          </div>
        </section>

        <section
          className="order-section section-space wrap"
          id="order"
          aria-labelledby="order-heading"
        >
          <div className="section-heading reveal">
            <div>
              <p className="eyebrow">
                <span className="section-number">03 /</span> GOOD FOOD, YOUR WAY
              </p>
              <h2 id="order-heading">
                LET’S EAT<span className="text-red">.</span>
              </h2>
            </div>
            <div className="heading-side">
              <p>
                Your next Mr Peri’s is a click away.
                <br />
                Choose a confirmed ordering option below.
              </p>
            </div>
          </div>
          <div className="order-list reveal">
            {business.ordering.map((platform, index) =>
              ordering.some((p) => p.name === platform.name) ? (
                <a
                  className="order-platform"
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={platform.name}
                >
                  <span className="platform-number">0{index + 1}</span>
                  <span className={`platform-name platform-${index}`}>
                    {platform.name}
                  </span>
                  <span className="platform-status">
                    Order online <Icon name="external" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </span>
                </a>
              ) : (
                <div
                  className="order-platform is-unavailable"
                  key={platform.name}
                >
                  <span className="platform-number">0{index + 1}</span>
                  <span className={`platform-name platform-${index}`}>
                    {platform.name}
                  </span>
                  <span className="platform-status">
                    Awaiting confirmation <Icon name="external" />
                  </span>
                </div>
              ),
            )}
            {phone && business.phoneOrderingConfirmed && (
              <a className="order-platform" href={phoneHref}>
                <span className="platform-number">04</span>
                <span className="platform-name">Call to order</span>
                <span className="platform-status">
                  {phone} <Icon name="phone" />
                </span>
              </a>
            )}
          </div>
          {!ordering.length && !business.phoneOrderingConfirmed && (
            <p className="order-note">
              Online ordering links will be enabled once the owner confirms the
              available services.
            </p>
          )}
        </section>

        <section
          className="location-section"
          id="location"
          aria-labelledby="location-heading"
        >
          <div className="location-inner wrap">
            <div className="location-intro reveal">
              <p className="eyebrow">
                <span className="section-number">04 /</span> SEE YOU AT MR
                PERI’S
              </p>
              <h2 id="location-heading">
                GOOD FOOD.
                <br />
                CLOSE BY<span className="text-red">.</span>
              </h2>
              <p>
                Take it away. Or pull up a chair.
                <br />
                We’d love to see you.
              </p>
              <div className="location-actions">
                {directions ? (
                  <a
                    className="button button-red"
                    href={directions}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get directions <Icon name="pin" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <button className="button button-red" disabled>
                    Get directions <Icon name="pin" />
                  </button>
                )}
                {phone ? (
                  <a className="text-link" href={phoneHref}>
                    Call us <Icon name="phone" />
                  </a>
                ) : (
                  <button className="text-link" disabled>
                    Call us <Icon name="phone" />
                  </button>
                )}
              </div>
              {!directions && (
                <p className="location-note">
                  Directions and calling will be available once details are
                  confirmed.
                </p>
              )}
            </div>
            <div className="location-details reveal">
              <div className="location-detail">
                <p className="eyebrow">FIND US</p>
                {address ? (
                  <address>
                    {address.street}
                    <br />
                    {address.locality}
                    <br />
                    {address.postcode}
                  </address>
                ) : (
                  <>
                    <p className="detail-title">Our spot, coming soon.</p>
                    <p>Full address awaiting owner confirmation.</p>
                  </>
                )}
              </div>
              <div className="location-detail">
                <p className="eyebrow">OPENING HOURS</p>
                {hours.length ? (
                  <dl className="hours">
                    {hours.map((day) => (
                      <div key={day.days}>
                        <dt>{day.days}</dt>
                        <dd>{day.hours}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <>
                    <p className="detail-title">Making time for good food.</p>
                    <p>Opening hours awaiting owner confirmation.</p>
                  </>
                )}
              </div>
              <div className="contact-row">
                <div>
                  <p className="eyebrow">LET’S TALK</p>
                  {phone ? (
                    <a href={phoneHref}>{phone}</a>
                  ) : (
                    <p>Phone number to be confirmed.</p>
                  )}
                </div>
                <Icon name="phone" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-top wrap">
          <Brand footer />
          <p>
            BIG FLAVOUR.
            <br />
            NO FUSS.
          </p>
          <div>
            {socials
              .filter((s) => /^https:\/\//.test(s.url))
              .map((s) => (
                <a
                  href={s.url}
                  key={s.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.name} <Icon name="external" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            <a href="#home" className="back-top">
              Back to top <Icon name="down" />
            </a>
          </div>
        </div>
        <div className="footer-bottom wrap">
          <span>
            © {new Date().getFullYear()} {business.name}. Simply Delicious.
          </span>
          <span>
            Designed & built by{" "}
            <a
              href="https://coderaxa.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Coderaxa<span className="sr-only"> (opens in a new tab)</span>
              <Icon name="external" />
            </a>
          </span>
        </div>
        {!business.publishReady && (
          <p className="preview-note wrap">
            DESIGN PREVIEW · Temporary wordmark and illustrative photos. Menu
            and business details awaiting owner confirmation.
          </p>
        )}
      </footer>
      <nav className="mobile-actions" aria-label="Quick actions">
        <a href="#menu">
          <Icon name="menu" />
          Menu
        </a>
        <a href="#order">
          <Icon name="external" />
          Order
        </a>
        {phone ? (
          <a href={phoneHref}>
            <Icon name="phone" />
            Call
          </a>
        ) : (
          <button
            disabled
            aria-label="Call unavailable until phone number is confirmed"
          >
            <Icon name="phone" />
            Call <small>soon</small>
          </button>
        )}
      </nav>
    </>
  );
}

export default App;
