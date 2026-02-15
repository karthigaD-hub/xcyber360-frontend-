import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Landing = () => {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 sm:px-10">
        <div />
        <Link to="/login">
          <Button variant="outline" className="font-medium">
            Login
          </Button>
        </Link>
      </header>

      {/* Center content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            X-Cyber360
          </h1>
          <p className="text-lg font-medium tracking-wide text-muted-foreground sm:text-xl">
            Cyber Security Assessment Platform
          </p>
        </div>
      </main>

      {/* Subtle glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
    </div>
  );
};

export default Landing;
