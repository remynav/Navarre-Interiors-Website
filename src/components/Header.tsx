import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-monogram.png";

const navLinkClass = (active: boolean) =>
  cn(
    "link-underline text-sm font-medium text-muted-foreground hover:text-foreground",
    active && "link-underline-active text-foreground",
  );

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md transition-[background-color] duration-300 ease-quiet",
        scrolled ? "bg-background/85" : "bg-background/60",
      )}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" onClick={handleLogoClick}>
            <img src={logo} alt="Navarre Interiors Design Studio" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
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
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Client Portal
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="gold" size="sm">
                Start a Project
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="p-2 md:hidden" type="button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mt-4 flex animate-fade-in flex-col gap-4 pb-4 md:hidden">
            <Link
              to="/services"
              className={navLinkClass(location.pathname === "/services")}
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/portfolio"
              className={navLinkClass(location.pathname === "/portfolio")}
              onClick={() => setIsMenuOpen(false)}
            >
              Portfolio
            </Link>
            <Link
              to="/about"
              className={navLinkClass(location.pathname === "/about")}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={navLinkClass(location.pathname === "/contact")}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full justify-start border-border/80">
                Client Portal
              </Button>
            </Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
              <Button variant="gold" size="sm" className="w-full">
                Start a Project
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
