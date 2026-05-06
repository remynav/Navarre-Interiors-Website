import palisadesMap from "@/assets/palisades-map.jpg";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

const AboutSection = () => {
  const eyebrowReveal = useScrollReveal<HTMLParagraphElement>({ threshold: 0.12 });
  const titleReveal = useScrollReveal<HTMLHeadingElement>({ threshold: 0.12 });
  const bodyReveal = useScrollReveal({ threshold: 0.08 });

  return (
    <section id="about" className="relative overflow-hidden bg-card py-24">
      {/* Background map image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
        style={{ backgroundImage: `url(${palisadesMap})` }}
      />
      <div className="relative z-10 container mx-auto px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p
            ref={eyebrowReveal.ref}
            className={cn(
              "eyebrow mb-6 justify-center",
              "scroll-reveal",
              eyebrowReveal.inView && "scroll-reveal-visible",
            )}
          >
            About Us
          </p>
          <h2
            ref={titleReveal.ref}
            className={cn(
              "font-display mb-8 text-display-lg font-semibold text-foreground text-balance tracking-tighter md:text-display-xl",
              "scroll-reveal",
              titleReveal.inView && "scroll-reveal-visible",
            )}
            style={{ transitionDelay: titleReveal.inView ? "90ms" : "0ms" }}
          >
            Design Philosophy
          </h2>
          <div
            ref={bodyReveal.ref}
            className={cn("space-y-6 text-left md:text-center", "scroll-reveal", bodyReveal.inView && "scroll-reveal-visible")}
            style={{ transitionDelay: bodyReveal.inView ? "160ms" : "0ms" }}
          >
            <p className="leading-relaxed text-muted-foreground">
              At Navarre Interiors, we believe great design goes beyond aesthetics. It is about creating spaces that
              nurture, inspire, and evolve alongside the people who live in them. Our work is rooted in timeless
              principles, elevated by contemporary sensibilities, and guided by a deep respect for the way a home shapes
              daily life.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Having lived in the Palisades for over 20 years, our connection to this community runs deep. We understand
              that homes here are more than structures; they are sacred places of memory, refuge, and belonging. In the
              wake of change and rebuilding, our mission extends beyond design alone: to thoughtfully restore and
              reimagine homes in a way that honors both personal history and the collective spirit of our community.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Over the years, we have had the privilege of working on a growing portfolio of projects, each one uniquely
              shaped by the people behind it. Rather than pursuing volume, we focus on depth—listening closely,
              understanding individual stories, and translating them into spaces that feel intentional, personal, and
              enduring.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              To support this level of care, Navarre Interiors is built with clarity and structure at its core. Our
              three distinct service packages and advanced client portal technology are designed to create focus,
              transparency, and organization throughout every phase of a project. This approach allows our clients to
              feel informed, supported, and confident, while ensuring the creative process remains thoughtful and
              seamless.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              At its heart, Navarre Interiors is about homes, the stories they carry, and a deep connection to the
              community we are proud to call home.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
