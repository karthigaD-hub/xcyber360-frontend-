import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { login, updateUser, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password change state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  const redirectByRole = (role: string) => {
    if (role === "ADMIN") navigate("/admin");
    else if (role === "AGENT") navigate("/agent");
    else if (role === "CUSTOMER") navigate("/customer");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      const stored = sessionStorage.getItem("xcyber_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.must_change_password) {
          setCurrentPwd(password);
          setShowChangePassword(true);
        } else {
          redirectByRole(parsed.role);
        }
      }
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err?.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPwd.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setChangingPwd(true);
    try {
      await authService.changePassword(currentPwd, newPwd);
      toast({ title: "Password changed successfully" });
      // Update user state
      if (user) {
        updateUser({ ...user, must_change_password: false });
      }
      setShowChangePassword(false);
      const stored = sessionStorage.getItem("xcyber_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.must_change_password = false;
        sessionStorage.setItem("xcyber_auth", JSON.stringify(parsed));
        redirectByRole(parsed.role);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to change password", variant: "destructive" });
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-background">
      <div className="absolute inset-0 grid-pattern opacity-15" />

      <div className="relative z-10 m-auto w-full max-w-sm px-4">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="mb-8 flex flex-col items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">X-Cyber360</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" type="email" placeholder="admin@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="h-11 w-full font-semibold" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in...
                </span>
              ) : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              First time?{" "}
              <Link to="/admin-register" className="font-medium text-primary hover:underline">
                Register Admin
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showChangePassword} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Change Your Password</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">You must change your temporary password before continuing.</p>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label>New Password *</Label>
              <Input type="password" placeholder="Min 8 characters" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required minLength={8} />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password *</Label>
              <Input type="password" placeholder="Re-enter password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required minLength={8} />
            </div>
            <Button type="submit" className="w-full" disabled={changingPwd}>
              {changingPwd ? "Changing..." : "Set New Password"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />
    </div>
  );
};

export default Login;
