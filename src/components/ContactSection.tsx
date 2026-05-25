import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import {
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
} from "@/lib/site";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    website: "", // Honeypot field - should remain empty
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const leftReveal = useScrollReveal({ threshold: 0.12 });
  const formReveal = useScrollReveal({ threshold: 0.1 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-contact-inquiry", {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          website: formData.website,
        },
      });

      if (error) {
        console.error("Error sending inquiry:", error);
        toast.error(`Failed to send message. Please try again or email us at ${CONTACT_EMAIL}.`);
        return;
      }

      toast.success("Thank you for your message! We'll be in touch soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        website: "",
      });
    } catch (error) {
      console.error("Error sending inquiry:", error);
      toast.error(`Failed to send message. Please try again or email us at ${CONTACT_EMAIL}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-background py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div
            ref={leftReveal.ref}
            className={cn("scroll-reveal", leftReveal.inView && "scroll-reveal-visible")}
          >
            <p className="eyebrow mb-4">Get In Touch</p>
            <h2 className="font-display mb-6 text-display-lg font-semibold text-foreground text-balance tracking-tighter md:text-display-xl">
              Let&apos;s Create Something Beautiful
            </h2>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              Ready to transform your space? We&apos;d love to hear about your project. Reach out to schedule a
              consultation.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 transition-colors duration-300 hover:text-gold">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10 transition-colors duration-300 hover:bg-gold/20">
                  <Mail className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="link-underline font-medium text-foreground hover:text-gold"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4 transition-colors duration-300 hover:text-gold">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10 transition-colors duration-300 hover:bg-gold/20">
                  <Phone className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a
                    href={CONTACT_PHONE_HREF}
                    className="link-underline font-medium text-foreground hover:text-gold"
                  >
                    {CONTACT_PHONE}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4 transition-colors duration-300 hover:text-gold">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10 transition-colors duration-300 hover:bg-gold/20">
                  <MapPin className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Based in</p>
                  <p className="font-medium text-foreground">{CONTACT_LOCATION.split(",")[0]}</p>
                </div>
              </div>
            </div>
          </div>

          <div
            ref={formReveal.ref}
            className={cn(
              "rounded-lg bg-card p-8 shadow-elev1 transition-all duration-300 ease-quiet hover:shadow-elev2",
              "scroll-reveal",
              formReveal.inView && "scroll-reveal-visible",
            )}
            style={{ transitionDelay: formReveal.inView ? "120ms" : "0ms" }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-foreground">
                  Full Name
                </label>
                <Input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                  required
                  className="bg-background"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="mb-2 block text-sm font-medium text-foreground">
                    Phone
                  </label>
                  <Input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="bg-background"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-foreground">
                  Tell us about your project
                </label>
                <Textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your vision, timeline, and any specific requirements..."
                  rows={5}
                  required
                  className="resize-none bg-background"
                />
              </div>
              {/* Honeypot field - hidden from users, catches bots */}
              <div className="absolute left-[-9999px]" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <Button type="submit" variant="gold" size="lg" className="group w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <span className="inline-block transition-transform duration-500 ease-elegant group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
