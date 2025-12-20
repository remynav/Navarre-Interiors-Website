import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const AdminAuth = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAdmin, signIn } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (!authLoading && user) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        toast.error("You don't have admin access");
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

  const handleLogin = async (e: React.FormEvent) => {
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
      }
      // Role check happens in useEffect after successful login
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-pulse text-primary-foreground/70">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-2xl font-semibold text-primary-foreground tracking-tight">
            Navarre<span className="text-gold"> Interiors</span>
          </Link>
          <p className="text-primary-foreground/70 mt-2">Admin Portal</p>
        </div>

        <div className="bg-background p-8 rounded-lg shadow-medium">
          <h1 className="font-display text-2xl font-semibold text-foreground mb-6 text-center">
            Admin Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
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
                placeholder="admin@navarre.com"
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
            Contact your administrator for access
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-gold transition-colors">
            <Lock className="w-4 h-4" />
            Back to Client Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
