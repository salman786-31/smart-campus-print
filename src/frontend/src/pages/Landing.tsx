import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  CreditCard,
  Printer,
  Settings,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const printers = [
  { name: "Library", status: "Working", queue: 2 },
  { name: "Computer Lab", status: "Working", queue: 0 },
  { name: "Department Block", status: "OutOfPaper", queue: 0 },
  { name: "Admin Office", status: "Working", queue: 1 },
  { name: "Hostel Area", status: "Offline", queue: 0 },
];

const statusConfig = {
  Working: {
    label: "Available",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  OutOfPaper: {
    label: "Out of Paper",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  Offline: {
    label: "Offline",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

const steps = [
  {
    icon: Upload,
    title: "Upload Document",
    desc: "Upload your PDF, DOCX, or image from your phone",
  },
  {
    icon: Settings,
    title: "Configure Settings",
    desc: "Choose printer, paper size, color mode, and copies",
  },
  {
    icon: CreditCard,
    title: "Pay Online",
    desc: "Instant price calculation and UPI payment",
  },
  {
    icon: Printer,
    title: "Print & Collect",
    desc: "Enter 6-digit code at printer and collect your document",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Printer className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">Smart Campus Print</span>
          </div>
          <Button size="sm" onClick={() => navigate("/login")}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-accent to-background py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Queue-Free Campus Printing
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
            Print Smarter,
            <br />
            Skip the Queue
          </h1>
          <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto">
            Upload documents from your phone, pay online, and collect prints at
            any campus printer — no waiting, no crowding.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate("/login")}>
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document
                  .getElementById("how")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Zap, label: "Instant Printing", val: "No queue" },
            { icon: Clock, label: "Save Time", val: "~30 min" },
            { icon: Users, label: "Campus Printers", val: "5 locations" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <s.icon className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-foreground">{s.val}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Printer Status */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-6">
            Campus Printer Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {printers.map((p) => {
              const cfg = statusConfig[p.status as keyof typeof statusConfig];
              return (
                <div
                  key={p.name}
                  className="bg-card border border-border rounded-lg p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Printer className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">{p.name}</span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.className}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Queue: {p.queue} job{p.queue !== 1 ? "s" : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-12 px-4 bg-accent/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative">
                  <step.icon className="w-5 h-5 text-primary" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 text-center">
        <h2 className="text-xl font-bold mb-3">Ready to print?</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Sign in with your college account and get started in minutes.
        </p>
        <Button size="lg" onClick={() => navigate("/login")}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Start Printing
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Printer className="w-4 h-4" />
            <span className="font-bold text-sm">Smart Campus Print</span>
          </div>
          <p className="text-xs opacity-60">
            Queue-Free College Printing System · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
