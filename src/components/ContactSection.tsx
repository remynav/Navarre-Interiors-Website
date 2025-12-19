import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for your message! We'll be in touch soon.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <p className="text-gold font-medium tracking-widest uppercase text-sm mb-4">
              Get In Touch
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
              Let's Create Something Beautiful
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Ready to transform your space? We'd love to hear about your project. Reach out to schedule a consultation.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">hello@maisondesign.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Studio</p>
                  <p className="font-medium text-foreground">123 Design Avenue, New York, NY</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-8 rounded-lg shadow-soft">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Full Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                  required
                  className="bg-background"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Tell us about your project
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your vision, timeline, and any specific requirements..."
                  rows={5}
                  required
                  className="bg-background resize-none"
                />
              </div>
              <Button type="submit" variant="gold" size="lg" className="w-full">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
