import { Link } from "react-router-dom";
import footerLogo from "@/assets/footer-logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary py-16 text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/">
              <img src={footerLogo} alt="Navarre Interiors Design Studio" className="h-28 w-auto" />
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
              <li>brandy@navarreinteriors.com</li>
              <li>+1 (310) 562-7213</li>
              <li>Pacific Palisades, 90272</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/20 pt-8 md:flex-row">
          <p className="text-sm text-primary-foreground/50">© 2024 Navarre Interiors. All rights reserved.</p>
          <div className="flex gap-6">
            <a
              href="#"
              className="link-underline text-sm text-primary-foreground/50 hover:text-gold-light"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="link-underline text-sm text-primary-foreground/50 hover:text-gold-light"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
