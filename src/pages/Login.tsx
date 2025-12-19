import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("clientLoggedIn");
    if (isLoggedIn === "true") {
      navigate("/client");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo login - in production this would use proper auth
    setTimeout(() => {
      if (email === "demo@client.com" && password === "demo123") {
        localStorage.setItem("clientLoggedIn", "true");
        toast.success("Welcome back!");
        navigate("/client");
      } else {
        toast.error("Invalid credentials. Try demo@client.com / demo123");
      }
      setIsLoading(false);
    }, 1000);
  };

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
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link to="/" className="font-display text-4xl font-semibold text-primary-foreground tracking-tight mb-8">
            Maison<span className="text-gold">.</span>
          </Link>
          <h2 className="font-display text-3xl text-primary-foreground mb-4">
            Welcome to Your Portal
          </h2>
          <p className="text-primary-foreground/70 max-w-md">
            Track your project progress, view design documents, and communicate with our team all in one place.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="lg:hidden font-display text-3xl font-semibold text-foreground tracking-tight mb-8 block">
            Maison<span className="text-gold">.</span>
          </Link>

          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
            Client Portal
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access your project dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-sm text-gold hover:underline">
                Forgot password?
              </a>
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

          <p className="text-center text-muted-foreground text-sm mt-8">
            Demo credentials: demo@client.com / demo123
          </p>

          <div className="mt-12 pt-8 border-t border-border">
            <Link
              to="/admin-login"
              className="text-sm text-muted-foreground hover:text-gold transition-colors block text-center"
            >
              Admin Login →
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

export default Login;
