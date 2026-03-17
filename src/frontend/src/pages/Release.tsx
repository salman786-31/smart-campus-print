import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Copy, Printer } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "../components/Navbar";

export default function Release() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    releaseCode: string;
    printerId: string;
  } | null;

  const handleCopy = () => {
    if (state?.releaseCode) {
      navigator.clipboard.writeText(state.releaseCode);
      toast.success("Code copied to clipboard");
    }
  };

  if (!state?.releaseCode) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">No release code found.</p>
          <Button onClick={() => navigate("/history")}>View Job History</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Printer className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Ready to Print!</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Go to <strong>{state.printerId}</strong> and enter this code
            </p>
          </div>

          <Card className="w-full max-w-xs border-2 border-primary/30 bg-primary/5">
            <CardContent className="pt-6 pb-6">
              <p className="text-xs text-muted-foreground mb-2">
                Your 6-Digit Release Code
              </p>
              <p className="text-5xl font-bold tracking-[0.3em] text-primary mb-4">
                {state.releaseCode}
              </p>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copy Code
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <div className="w-full max-w-sm text-left">
            <h3 className="font-semibold text-sm mb-3">Steps to Print:</h3>
            <div className="flex flex-col gap-3">
              {[
                "Walk to the selected printer location",
                'On the printer screen, select "Enter Release Code"',
                `Type your 6-digit code: ${state.releaseCode}`,
                "Press Print and collect your document",
              ].map((step, i) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col gap-3 max-w-xs">
            <Button variant="outline" onClick={() => navigate("/history")}>
              <CheckCircle className="w-4 h-4 mr-2" />
              View Job Status
            </Button>
            <Button variant="ghost" onClick={() => navigate("/upload")}>
              Print Another Document
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
