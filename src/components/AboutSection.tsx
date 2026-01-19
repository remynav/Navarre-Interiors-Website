const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-gold font-medium tracking-widest uppercase text-sm mb-4">
              About Us
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
              Design Philosophy
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              At Maison, we believe that great design goes beyond aesthetics. It's about creating spaces that nurture, inspire, and evolve with you. Our approach combines timeless principles with contemporary sensibilities.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              With over 15 years of experience, our team has transformed hundreds of spaces into personalized sanctuaries. We take pride in understanding your unique story and translating it into environments that feel distinctly yours.
            </p>
            
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="font-display text-4xl font-semibold text-gold">150+</p>
                <p className="text-muted-foreground text-sm mt-1">Projects Completed</p>
              </div>
              <div>
                <p className="font-display text-4xl font-semibold text-gold">15</p>
                <p className="text-muted-foreground text-sm mt-1">Years Experience</p>
              </div>
              <div>
                <p className="font-display text-4xl font-semibold text-gold">98%</p>
                <p className="text-muted-foreground text-sm mt-1">Client Satisfaction</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
