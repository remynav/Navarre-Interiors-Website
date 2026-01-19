import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    website: "" // Honeypot field - should remain empty
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-inquiry', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          website: formData.website // Send honeypot field
        }
      });

      if (error) {
        console.error("Error sending inquiry:", error);
        toast.error("Failed to send message. Please try again or email us directly.");
        return;
      }

      toast.success("Thank you for your message! We'll be in touch soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        website: ""
      });
    } catch (error) {
      console.error("Error sending inquiry:", error);
      toast.error("Failed to send message. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <section id="contact" className="py-24 bg-background">
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
                  <p className="font-medium text-foreground">info@navarreinteriors.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">+1 (310) 562-7213</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Based in</p>
                  <p className="font-medium text-foreground">Pacific Palisades</p>
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
                <Input value={formData.name} onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} placeholder="John Smith" required className="bg-background" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email
                  </label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({
                  ...formData,
                  email: e.target.value
                })} placeholder="john@example.com" required className="bg-background" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Phone
                  </label>
                  <Input type="tel" value={formData.phone} onChange={e => setFormData({
                  ...formData,
                  phone: e.target.value
                })} placeholder="+1 (555) 000-0000" className="bg-background" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Tell us about your project
                </label>
              <Textarea value={formData.message} onChange={e => setFormData({
                ...formData,
                message: e.target.value
              })} placeholder="Describe your vision, timeline, and any specific requirements..." rows={5} required className="bg-background resize-none" />
              </div>
              {/* Honeypot field - hidden from users, catches bots */}
              <div className="absolute left-[-9999px]" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>;
};
export default ContactSection;