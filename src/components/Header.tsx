import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-monogram.png";

const HEADER_DELAY_MS = 1400;
const MENU_TRIGGER_STAGGER_MS = 450;

const navLinkClass = (active: boolean) =>
  cn(
    "link-underline text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300",
    active && "link-underline-active text-foreground",
  );

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [shellVisible, setShellVisible] = useState(!isHome);
  const [logoReveal, setLogoReveal] = useState(!isHome);
  const [compactTriggerReveal, setCompactTriggerReveal] = useState(!isHome);
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
      setShellVisible(true);
      setLogoReveal(true);
      setCompactTriggerReveal(true);
      setHomeMegaOpen(false);
      return;
    }

    setShellVisible(false);
    setLogoReveal(false);
    setCompactTriggerReveal(false);
    setHomeMegaOpen(false);

    timeoutsRef.current.push(
      window.setTimeout(() => {
        setShellVisible(true);
        setLogoReveal(true);
        timeoutsRef.current.push(window.setTimeout(() => setCompactTriggerReveal(true), MENU_TRIGGER_STAGGER_MS));
      }, HEADER_DELAY_MS),
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
      <Link to="/services" className={navLinkClass(location.pathname === "/services")}>
        Services
      </Link>
      <Link to="/portfolio" className={navLinkClass(location.pathname === "/portfolio")}>
        Portfolio
      </Link>
      <Link to="/about" className={navLinkClass(location.pathname === "/about")}>
        About
      </Link>
      <Link to="/contact" className={navLinkClass(location.pathname === "/contact")}>
        Contact
      </Link>
    </>
  );

  /** Hero is full-bleed under header: no bar until user scrolls off the top */
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

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50",
        "transition-[opacity,background-color,transform,backdrop-filter,border-color] duration-700 ease-elegant",
        shellVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
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
            <div
              className={cn(
                "relative flex h-11 items-center",
                homeMegaOpen &&
                  (overlayOnHero
                    ? "border-foreground/10 md:border-b"
                    : "border-border/40 md:border-b"),
              )}
            >
              <Link
                to="/"
                onClick={handleLogoClick}
                className={cn(
                  "relative z-[1] shrink-0 transition-[opacity,transform] duration-700 ease-elegant",
                  logoReveal ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
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

              {homeMegaOpen && (
                <nav
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-1/2 hidden max-w-[60%] min-w-0 -translate-x-1/2 -translate-y-1/2 flex-wrap justify-center gap-x-8 gap-y-2 animate-menu-sweep-in md:pointer-events-auto md:flex",
                    overlayOnHero &&
                      "[&_a]:text-foreground [&_a:hover]:text-gold [&_a.link-underline-active]:text-foreground [&_a]:drop-shadow-[0_1px_2px_rgba(255,255,255,0.88)]",
                  )}
                  style={{ animationDelay: "120ms" }}
                >
                  {navLinksEl}
                </nav>
              )}

              <div
                className={cn(
                  "relative z-[1] ml-auto flex items-center gap-4 transition-opacity duration-500 ease-elegant",
                  compactTriggerReveal ? "opacity-100" : "pointer-events-none opacity-0",
                  homeMegaOpen && "md:gap-6",
                )}
              >
                {homeMegaOpen && (
                  <div className="hidden animate-menu-sweep-in md:flex md:gap-6">{ctaPair}</div>
                )}

                {!homeMegaOpen ? (
                  <button
                    type="button"
                    onClick={() => setHomeMegaOpen(true)}
                    className={cn(
                      "group inline-flex cursor-pointer items-center gap-2.5 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] text-foreground outline-none ring-offset-background transition-colors hover:text-gold focus-visible:ring-2 focus-visible:ring-ring",
                      overlayOnHero && "drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]",
                    )}
                  >
                    <span
                      aria-hidden
                      className="text-lg leading-none font-light text-gold transition-transform duration-500 ease-elegant group-hover:rotate-90"
                    >
                      +
                    </span>
                    <span className="leading-none">Menu</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setHomeMegaOpen(false)}
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
                "grid overflow-hidden transition-[grid-template-rows] duration-500 ease-elegant md:hidden",
                homeMegaOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0">
                {homeMegaOpen && (
                  <div
                    className={cn(
                      "border-t pt-4 animate-fade-in md:hidden",
                      overlayOnHero ? "border-foreground/15" : "border-border/40",
                    )}
                  >
                    <nav className="flex flex-col gap-4">
                      <Link to="/services" className={navLinkClass(location.pathname === "/services")} onClick={() => setHomeMegaOpen(false)}>
                        Services
                      </Link>
                      <Link to="/portfolio" className={navLinkClass(location.pathname === "/portfolio")} onClick={() => setHomeMegaOpen(false)}>
                        Portfolio
                      </Link>
                      <Link to="/about" className={navLinkClass(location.pathname === "/about")} onClick={() => setHomeMegaOpen(false)}>
                        About
                      </Link>
                      <Link to="/contact" className={navLinkClass(location.pathname === "/contact")} onClick={() => setHomeMegaOpen(false)}>
                        Contact
                      </Link>
                    </nav>
                    <div
                      className={cn(
                        "mt-5 border-t pt-5",
                        overlayOnHero ? "border-foreground/15" : "border-border/40",
                      )}
                    >
                      {ctaPair}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
