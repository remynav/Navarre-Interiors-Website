const AboutSection = () => {
  return <section id="about" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-gold font-medium tracking-widest uppercase text-sm mb-4">
              About Us
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
              Design Philosophy
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">At Navarre Interiors, we believe that great design goes beyond aesthetics. It's about creating spaces that nurture, inspire, and evolve with you. Our approach combines timeless principles with contemporary sensibilities.</p>
            <p className="text-muted-foreground mb-8 leading-relaxed">With 8 past projects, our team has transformed spaces into personalized sanctuaries. We take pride in understanding your unique story and translating it into environments that feel distinctly yours.</p>
            
            
          </div>

        </div>
      </div>
    </section>;
};
export default AboutSection;