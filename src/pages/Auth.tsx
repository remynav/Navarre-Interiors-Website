import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import navarreFullLogoLight from "@/assets/navarre-full-logo-light.png";
import navarreFullLogoDark from "@/assets/navarre-full-logo-dark.png";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAdmin, signIn } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (!authLoading && user) {
      // Redirect based on role
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/client");
      }
    }
  }, [user, authLoading, isAdmin, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-charcoal" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border border-gold/30 rounded-full" />
          <div className="absolute bottom-40 right-20 w-96 h-96 border border-gold/20 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 border border-gold/40 rounded-full" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center px-16">
          <Link to="/" className="mb-8">
            <img src={navarreFullLogoLight} alt="Navarre Interiors" className="h-32 w-auto" />
          </Link>
          <h2 className="font-display text-3xl text-primary-foreground mb-4">
            Welcome to Your Portal
          </h2>
          <p className="text-primary-foreground/70 max-w-md">
            Track your project progress, view design documents, and communicate with our team all in one place.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="lg:hidden mb-8 flex justify-center">
            <img src={navarreFullLogoDark} alt="Navarre Interiors" className="h-32 w-auto" />
          </Link>

          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
            Client Portal
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access your project dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: undefined });
                }}
                placeholder="you@example.com"
                required
                className={`h-12 ${errors.email ? "border-destructive" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: undefined });
                }}
                placeholder="••••••••"
                required
                className={`h-12 ${errors.password ? "border-destructive" : ""}`}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="gold"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-6">
            Contact your designer for portal access
          </p>

          <div className="mt-12 pt-8 border-t border-border">
            <Link
              to="/admin-login"
              className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors w-full"
            >
              <Lock className="w-4 h-4" />
              Admin Login
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
