import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/navarre-full-logo-dark.png";

const HERO_UI_DELAY_MS = 1400;
const homeHeaderRevealClass =
  "transition-[opacity,transform] duration-[1400ms] ease-out";

const navLinkClass = (active: boolean) =>
  cn(
    "link-underline text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300",
    active && "link-underline-active text-foreground",
  );

const navItems = [
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [homeUiRevealed, setHomeUiRevealed] = useState(!isHome);
  const [homeMegaOpen, setHomeMegaOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const timeoutsRef = useRef<number[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    setMobileNavOpen(false);
    clearAllTimeouts();

    if (!isHome) {
      setHomeUiRevealed(true);
      setHomeMegaOpen(false);
      return;
    }

    setHomeUiRevealed(false);
    setHomeMegaOpen(false);

    timeoutsRef.current.push(
      window.setTimeout(() => {
        setHomeUiRevealed(true);
      }, HERO_UI_DELAY_MS),
    );

    return () => clearAllTimeouts();
  }, [isHome]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setHomeMegaOpen(false);
    }
  };

  const navLinksEl = (
    <>
      {navItems.map((item) => (
        <Link key={item.to} to={item.to} className={navLinkClass(location.pathname === item.to)}>
          {item.label}
        </Link>
      ))}
    </>
  );

  const overlayOnHero = isHome && !scrolled;

  const ctaPair = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Link to="/auth" onClick={() => setMobileNavOpen(false)}>
        <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground sm:w-auto">
          Client Portal
        </Button>
      </Link>
      <Link to="/contact" onClick={() => setMobileNavOpen(false)}>
        <Button variant="gold" size="sm" className="w-full sm:w-auto">
          Start a Project
        </Button>
      </Link>
    </div>
  );

  const homeRevealVisible = homeUiRevealed;

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50",
        isHome
          ? cn(homeHeaderRevealClass, homeRevealVisible ? "opacity-100" : "pointer-events-none opacity-0")
          : "transition-[background-color,border-color] duration-300 ease-out",
        overlayOnHero
          ? "border-transparent bg-transparent shadow-none backdrop-blur-none"
          : "border-b border-border/50 bg-background/90 backdrop-blur-md",
      )}
    >
      <div className={cn("relative container mx-auto px-6", isHome ? "py-3 md:py-4" : "py-4")}>
        {!isHome && (
          <>
            <div className="flex items-center justify-between">
              <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                <img src={logo} alt="Navarre Interiors Design Studio" className="h-10 w-auto" />
              </Link>

              <nav className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:pointer-events-auto md:flex">
                {navLinksEl}
              </nav>

              <div className="hidden md:block">{ctaPair}</div>

              <button
                type="button"
                className="p-2 md:hidden"
                onClick={() => setMobileNavOpen((o) => !o)}
                aria-expanded={mobileNavOpen}
                aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {mobileNavOpen && (
              <nav className="mt-4 flex animate-fade-in flex-col gap-4 border-border/35 border-t pt-4 pb-2 md:hidden">
                <Link to="/services" className={navLinkClass(location.pathname === "/services")} onClick={() => setMobileNavOpen(false)}>
                  Services
                </Link>
                <Link to="/portfolio" className={navLinkClass(location.pathname === "/portfolio")} onClick={() => setMobileNavOpen(false)}>
                  Portfolio
                </Link>
                <Link to="/about" className={navLinkClass(location.pathname === "/about")} onClick={() => setMobileNavOpen(false)}>
                  About
                </Link>
                <Link to="/contact" className={navLinkClass(location.pathname === "/contact")} onClick={() => setMobileNavOpen(false)}>
                  Contact
                </Link>
                <div className="flex flex-col gap-3">{ctaPair}</div>
              </nav>
            )}
          </>
        )}

        {isHome && (
          <>
            <div className="relative flex h-11 items-center">
              <Link
                to="/"
                onClick={handleLogoClick}
                className={cn(
                  "relative z-[1] shrink-0",
                  homeHeaderRevealClass,
                  homeRevealVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
                )}
              >
                <img
                  src={logo}
                  alt="Navarre Interiors Design Studio"
                  className={cn(
                    "h-10 w-auto",
                    overlayOnHero && "drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)]",
                  )}
                />
              </Link>

              <nav
                className={cn(
                  "pointer-events-none absolute left-1/2 top-1/2 hidden max-w-[60%] min-w-0 -translate-x-1/2 -translate-y-1/2 flex-wrap justify-center gap-x-8 gap-y-2 transition-opacity duration-300 ease-out md:flex",
                  homeMegaOpen ? "opacity-100 md:pointer-events-auto" : "opacity-0",
                  overlayOnHero &&
                    "[&_a]:text-foreground [&_a:hover]:text-gold [&_a.link-underline-active]:text-foreground [&_a]:drop-shadow-[0_1px_2px_rgba(255,255,255,0.88)]",
                )}
                aria-hidden={!homeMegaOpen}
              >
                {navItems.map((item) => (
                  <Link key={`home-menu-${item.to}`} to={item.to} className={navLinkClass(location.pathname === item.to)}>
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div
                className={cn(
                  "relative z-[1] ml-auto flex items-center gap-4",
                  homeHeaderRevealClass,
                  homeRevealVisible ? "opacity-100" : "pointer-events-none opacity-0",
                  homeMegaOpen && "md:gap-6",
                )}
              >
                <div
                  className={cn(
                    "hidden transition-opacity duration-300 ease-out md:flex md:gap-6",
                    homeMegaOpen ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                  aria-hidden={!homeMegaOpen}
                >
                  {ctaPair}
                </div>

                {!homeMegaOpen ? (
                  <button
                    type="button"
                    onClick={() => setHomeMegaOpen(true)}
                    aria-label="Open menu"
                    aria-expanded={false}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2.5 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] text-foreground outline-none ring-offset-background transition-colors hover:text-gold focus-visible:ring-2 focus-visible:ring-ring",
                      overlayOnHero && "drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]",
                    )}
                  >
                    <span aria-hidden className="text-lg leading-none font-light text-gold">
                      +
                    </span>
                    <span className="leading-none">Menu</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setHomeMegaOpen(false)}
                    aria-label="Close menu"
                    aria-expanded={true}
                    className={cn(
                      "inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground outline-none ring-offset-background transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                      overlayOnHero && "text-foreground/90 drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] hover:text-foreground",
                    )}
                  >
                    <span aria-hidden className="text-lg leading-none">
                      −
                    </span>
                    Close
                  </button>
                )}
              </div>
            </div>

            <div
              className={cn(
                "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out md:hidden",
                homeMegaOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0">
                <div
                  className={cn(
                    "pt-4 transition-opacity duration-300 ease-out md:hidden",
                    homeMegaOpen ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                  aria-hidden={!homeMegaOpen}
                >
                  <nav className="flex flex-col gap-4">
                    {navItems.map((item) => (
                      <Link
                        key={`home-mobile-${item.to}`}
                        to={item.to}
                        className={navLinkClass(location.pathname === item.to)}
                        onClick={() => setHomeMegaOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-5 pt-5">{ctaPair}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
