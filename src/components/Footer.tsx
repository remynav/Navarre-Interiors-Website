import { Link } from "react-router-dom";
import footerLogo from "@/assets/footer-logo.png";
import {
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
} from "@/lib/site";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary py-16 text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/">
              <img
                src={footerLogo}
                alt="Navarre Interiors Design Studio"
                className="h-28 w-auto"
                loading="lazy"
                decoding="async"
              />
            </Link>
          </div>

          <div>
            <h4 className="font-display mb-5 text-lg font-medium tracking-display">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/services"
                  className="link-underline text-sm text-primary-foreground/75 hover:text-gold-light"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/portfolio"
                  className="link-underline text-sm text-primary-foreground/75 hover:text-gold-light"
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="link-underline text-sm text-primary-foreground/75 hover:text-gold-light"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="link-underline text-sm text-primary-foreground/75 hover:text-gold-light"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display mb-5 text-lg font-medium tracking-display">Contact</h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline hover:text-gold-light">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a href={CONTACT_PHONE_HREF} className="link-underline hover:text-gold-light">
                  {CONTACT_PHONE}
                </a>
              </li>
              <li>{CONTACT_LOCATION}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/20 pt-8">
          <p className="text-center text-sm text-primary-foreground/50 md:text-left">
            © {year} Navarre Interiors. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
