import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo login - in production this would use proper auth
    setTimeout(() => {
      if (email === "admin@navarre.com" && password === "admin123") {
        toast.success("Welcome, Admin!");
        navigate("/admin");
      } else {
        toast.error("Invalid credentials. Try admin@navarre.com / admin123");
      }
      setIsLoading(false);
    }, 1000);
  };

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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@navarre.com"
                required
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-12"
              />
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
            Demo: admin@navarre.com / admin123
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-gold transition-colors">
            <Lock className="w-4 h-4" />
            Back to Client Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
