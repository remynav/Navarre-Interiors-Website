import { Link } from "react-router-dom";

import heroImage from "@/assets/hero-living-room.webp";
import heroLogo from "@/assets/navarre-hero-logo.png";

const linkClass =
  "group link-underline inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-foreground/80 hover:text-gold animate-reveal-up [animation-fill-mode:both]";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxurious modern living room interior"
          className="h-full w-full object-cover"
          style={{ objectPosition: "10% 80%" }}
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-overlay-tint pointer-events-none absolute inset-0" aria-hidden />
        <div className="hero-overlay-wash animate-hero-ui-fade pointer-events-none absolute inset-0" aria-hidden />
      </div>

      {/* Large wordmark — ~1/5 viewport height, top-left (not in header) */}
      <Link
        to="/"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="animate-hero-ui-fade absolute left-5 top-5 z-20 sm:left-8 sm:top-8 md:left-10 md:top-10"
        aria-label="Navarre Interiors — scroll to top"
      >
        <img
          src={heroLogo}
          alt="Navarre Interiors Design Studio"
          className="h-[20vh] max-h-[220px] w-auto min-h-[72px] object-contain object-left drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] sm:max-h-none"
          decoding="async"
        />
      </Link>

      {/* Headline + CTAs — hugging the right edge */}
      <div className="relative z-10 ml-auto w-full max-w-[min(100%,28rem)] pl-6 pr-4 text-left sm:max-w-md sm:pl-8 sm:pr-5 md:max-w-lg md:pr-6 lg:max-w-xl lg:pr-8">
        <h1 className="animate-hero-ui-fade font-display text-[1.75rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-[2rem] md:text-[2.35rem] lg:text-[2.65rem]">
          Thoughtful design.
          <br />
          Transparent pricing.
          <br />
          <span className="font-normal italic text-gold">A clearer way to create home.</span>
        </h1>

        <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:items-center sm:gap-10">
          <Link to="/contact" className={`${linkClass} [animation-delay:300ms]`}>
            Start a project
            <span className="inline-block transition-transform duration-500 ease-elegant group-hover:translate-x-1">→</span>
          </Link>
          <Link to="/portfolio" className={`${linkClass} [animation-delay:400ms]`}>
            View portfolio
            <span className="inline-block transition-transform duration-500 ease-elegant group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
