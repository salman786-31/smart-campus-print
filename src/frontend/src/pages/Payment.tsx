import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ColorMode,
  type ExternalBlob,
  type PageSize,
  PrintJobStatus,
  PrintSide,
} from "../backend";
import type { PrintJob } from "../backend";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";

function formatPrice(paise: bigint) {
  return `₹${(Number(paise) / 100).toFixed(2)}`;
}

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { actor } = useActor();
  const state = location.state as {
    blob: ExternalBlob;
    fileName: string;
    fileType: string;
    printerId: string;
    copies: number;
    colorMode: ColorMode;
    printSide: PrintSide;
    pageSize: PageSize;
    totalPages: number;
    pageRange: string;
    orientation: string;
    price: bigint;
  } | null;

  const [upiId, setUpiId] = useState("");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [releaseCode, setReleaseCode] = useState("");

  const handlePay = async () => {
    if (!actor || !state) return;
    if (!upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID (e.g. name@upi)");
      return;
    }
    setPaying(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const jobId = crypto.randomUUID();
      const job: PrintJob = {
        jobId,
        userId: "",
        printerId: state.printerId,
        fileBlob: state.blob,
        fileName: `${code}::${state.fileName}`,
        fileType: state.fileType,
        pagesCount: BigInt(state.totalPages),
        pagesPerCopyCount: BigInt(state.totalPages),
        copiesCount: BigInt(state.copies),
        colorMode: state.colorMode,
        paperSize: state.pageSize,
        sidesCount: BigInt(state.printSide === PrintSide.Double ? 2 : 1),
        colorPagesCount: BigInt(
          state.colorMode === ColorMode.Color ? state.totalPages : 0,
        ),
        onlyBW: state.colorMode === ColorMode.BW,
        price: state.price,
        status: PrintJobStatus.readyToPrint,
      };
      await actor.createPrintJob(jobId, job);
      setReleaseCode(code);
      setPaid(true);
      toast.success("Payment successful!");
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">No print job configured.</p>
          <Button onClick={() => navigate("/upload")}>Start New Job</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8">
        {!paid ? (
          <>
            <h1 className="text-xl font-bold mb-1">Payment</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Complete payment to generate your print release code.
            </p>

            {/* Order Summary */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File</span>
                  <span className="font-medium truncate max-w-[200px]">
                    {state.fileName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Printer</span>
                  <span>{state.printerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pages × Copies</span>
                  <span>
                    {state.totalPages} × {state.copies}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Color</span>
                  <span>{state.colorMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Side</span>
                  <span>{state.printSide}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size</span>
                  <span>{state.pageSize}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary text-lg">
                    {formatPrice(state.price)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* UPI Payment */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  UPI Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  <Label htmlFor="upi">UPI ID</Label>
                  <Input
                    id="upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                  />
                  <p className="text-xs text-muted-foreground">
                    e.g. rahul@okaxis, 9876543210@paytm
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handlePay}
              disabled={paying || !upiId}
              className="w-full"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                `Pay ${formatPrice(state.price)}`
              )}
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center gap-6 py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Payment Successful!</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Your print release code is ready
              </p>
            </div>
            <div className="w-full max-w-xs bg-primary/5 border-2 border-primary/30 rounded-2xl p-6">
              <p className="text-xs text-muted-foreground mb-2">
                6-Digit Release Code
              </p>
              <p className="text-4xl font-bold tracking-[0.3em] text-primary">
                {releaseCode}
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button
                onClick={() =>
                  navigate("/release", {
                    state: { releaseCode, printerId: state.printerId },
                  })
                }
                className="w-full"
              >
                View Release Instructions
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/history")}
                className="w-full"
              >
                View Job History
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
