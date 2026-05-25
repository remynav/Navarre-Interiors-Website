import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import logoMonogram from "@/assets/logo-monogram.png";

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

  const closeMenus = () => {
    setMobileNavOpen(false);
    setHomeMegaOpen(false);
  };

  useEffect(() => {
    closeMenus();
    clearAllTimeouts();

    if (!isHome) {
      setHomeUiRevealed(true);
      return;
    }

    setHomeUiRevealed(false);

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

  const overlayOnHero = isHome && !scrolled;
  // Home: transparent over hero unless burger menu is open or user has scrolled
  const headerSolid = !isHome || !overlayOnHero || mobileNavOpen;
  const homeRevealVisible = homeUiRevealed;

  const ctaPair = (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 lg:gap-3">
      <Link to="/auth" onClick={closeMenus}>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-full whitespace-nowrap px-2.5 text-xs text-muted-foreground hover:text-foreground sm:w-auto lg:px-3 lg:text-sm"
        >
          Client Portal
        </Button>
      </Link>
      <Link to="/contact" onClick={closeMenus}>
        <Button variant="gold" size="sm" className="h-9 w-full whitespace-nowrap px-2.5 text-xs sm:w-auto lg:px-3 lg:text-sm">
          Start a Project
        </Button>
      </Link>
    </div>
  );

  const mobileNavDropdown = (
    <nav className="mt-4 flex animate-fade-in flex-col gap-4 border-border/35 border-t pt-4 pb-2 lg:hidden">
      {navItems.map((item) => (
        <Link
          key={`mobile-${item.to}`}
          to={item.to}
          className={navLinkClass(location.pathname === item.to)}
          onClick={closeMenus}
        >
          {item.label}
        </Link>
      ))}
      <div className="flex flex-col gap-3">{ctaPair}</div>
    </nav>
  );

  const burgerButton = (
    <button
      type="button"
      className="p-2"
      onClick={() => {
        setHomeMegaOpen(false);
        setMobileNavOpen((o) => !o);
      }}
      aria-expanded={mobileNavOpen}
      aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
    >
      {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ease-out",
        isHome && cn(homeHeaderRevealClass, homeRevealVisible ? "opacity-100" : "pointer-events-none opacity-0"),
        headerSolid
          ? "border-b border-border/50 bg-background/95 shadow-sm backdrop-blur-md"
          : "border-transparent bg-transparent shadow-none backdrop-blur-none",
      )}
    >
      <div className={cn("relative container mx-auto px-6", isHome ? "py-3 md:py-4" : "py-4")}>
        {!isHome && (
          <>
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 lg:gap-6">
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="shrink-0"
              >
                <img src={logoMonogram} alt="Navarre Interiors" className="h-9 w-auto md:h-10" />
              </Link>

              <nav className="hidden min-w-0 justify-center lg:flex">
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 xl:gap-x-8">
                  {navItems.map((item) => (
                    <Link key={item.to} to={item.to} className={navLinkClass(location.pathname === item.to)}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="flex shrink-0 items-center justify-end gap-2">
                <div className="hidden lg:block">{ctaPair}</div>
                <div className="lg:hidden">{burgerButton}</div>
              </div>
            </div>

            {mobileNavOpen && mobileNavDropdown}
          </>
        )}

        {isHome && (
          <>
            {/* Tablet / mobile: same burger + white dropdown as other pages */}
            <div
              className={cn(
                "flex items-center justify-end lg:hidden",
                homeHeaderRevealClass,
                homeRevealVisible ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              {burgerButton}
            </div>

            {mobileNavOpen && mobileNavDropdown}

            {/* Desktop: + Menu expand with centered nav */}
            <div className="relative hidden h-11 items-center justify-end lg:flex md:h-12">
              <nav
                className={cn(
                  "pointer-events-none absolute left-1/2 top-1/2 flex max-w-[min(100%,36rem)] min-w-0 -translate-x-1/2 -translate-y-1/2 flex-wrap justify-center gap-x-6 gap-y-2 transition-opacity duration-300 ease-out xl:gap-x-8",
                  homeMegaOpen ? "opacity-100 lg:pointer-events-auto" : "opacity-0",
                  overlayOnHero &&
                    !headerSolid &&
                    "[&_a]:text-foreground [&_a:hover]:text-gold [&_a.link-underline-active]:text-foreground [&_a]:drop-shadow-[0_1px_2px_rgba(255,255,255,0.88)]",
                )}
                aria-hidden={!homeMegaOpen}
              >
                {navItems.map((item) => (
                  <Link
                    key={`home-menu-${item.to}`}
                    to={item.to}
                    className={navLinkClass(location.pathname === item.to)}
                    onClick={() => setHomeMegaOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div
                className={cn(
                  "relative z-[1] ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 lg:gap-3",
                  homeHeaderRevealClass,
                  homeRevealVisible ? "opacity-100" : "pointer-events-none opacity-0",
                  homeMegaOpen && "lg:gap-4",
                )}
              >
                <div
                  className={cn(
                    "hidden shrink-0 transition-opacity duration-300 ease-out lg:flex",
                    homeMegaOpen ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                  aria-hidden={!homeMegaOpen}
                >
                  {ctaPair}
                </div>

                {!homeMegaOpen ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      setHomeMegaOpen(true);
                    }}
                    aria-label="Open menu"
                    aria-expanded={false}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2.5 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] text-foreground outline-none ring-offset-background transition-colors hover:text-gold focus-visible:ring-2 focus-visible:ring-ring",
                      overlayOnHero && !headerSolid && "drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]",
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
                      overlayOnHero &&
                        !headerSolid &&
                        "text-foreground/90 drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] hover:text-foreground",
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
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
