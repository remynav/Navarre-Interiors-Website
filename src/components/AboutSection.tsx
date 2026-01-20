import palisadesMap from "@/assets/palisades-map.jpg";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-card relative overflow-hidden">
      {/* Background map image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
        style={{ backgroundImage: `url(${palisadesMap})` }}
      />
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-gold font-medium tracking-widest uppercase text-sm mb-4">
              About Us
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
              Design Philosophy
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">At Navarre Interiors, we believe great design goes beyond aesthetics. It is about creating spaces that nurture, inspire, and evolve alongside the people who live in them. Our work is rooted in timeless principles, elevated by contemporary sensibilities, and guided by a deep respect for the way a home shapes daily life.
          </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">Having lived in the Palisades for over 20 years, our connection to this community runs deep. We understand that homes here are more than structures; they are sacred places of memory, refuge, and belonging. In the wake of change and rebuilding, our mission extends beyond design alone: to thoughtfully restore and reimagine homes in a way that honors both personal history and the collective spirit of our community.
          </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">Over the years, we have had the privilege of working on a growing portfolio of projects, each one uniquely shaped by the people behind it. Rather than pursuing volume, we focus on depth—listening closely, understanding individual stories, and translating them into spaces that feel intentional, personal, and enduring.
          </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">To support this level of care, Navarre Interiors is built with clarity and structure at its core. Our three distinct service packages and advanced client portal technology are designed to create focus, transparency, and organization throughout every phase of a project. This approach allows our clients to feel informed, supported, and confident, while ensuring the creative process remains thoughtful and seamless.
          </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">At its heart, Navarre Interiors is about homes, the stories they carry, and a deep connection to the community we are proud to call home.

          </p>
          </div>

        </div>
      </div>
    </section>
  );
};
export default AboutSection;