import { Link } from "react-router-dom";
import footerLogo from "@/assets/footer-logo.png";
const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link to="/">
              <img src={footerLogo} alt="Navarre Interiors Design Studio" className="h-28 w-auto" />
            </Link>
            <p className="mt-4 text-primary-foreground/70 max-w-md">​</p>
          </div>

          <div>
            <h4 className="font-display text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#packages" className="text-primary-foreground/70 hover:text-gold transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#portfolio" className="text-primary-foreground/70 hover:text-gold transition-colors">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#about" className="text-primary-foreground/70 hover:text-gold transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-primary-foreground/70 hover:text-gold transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-medium mb-4">Contact</h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>brandy@navarreinteriors.com</li>
              <li>+1 (310) 562-7213</li>
              <li>Pacific Palisades, 90272</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/50 text-sm">© 2024 Navarre Interiors. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-primary-foreground/50 hover:text-gold text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-primary-foreground/50 hover:text-gold text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
