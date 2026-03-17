import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ColorMode,
  type ExternalBlob,
  PageSize,
  PrintJobStatus,
  PrintSide,
  PrinterStatus,
} from "../backend";
import type { PrintJob } from "../backend";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";

function formatPrice(paise: bigint) {
  return `₹${(Number(paise) / 100).toFixed(2)}`;
}

export default function Configure() {
  const navigate = useNavigate();
  const location = useLocation();
  const { actor } = useActor();
  const state = location.state as {
    blob: ExternalBlob;
    fileName: string;
    fileType: string;
    fileSize: number;
  } | null;

  const [printerId, setPrinterId] = useState("");
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState<ColorMode>(ColorMode.BW);
  const [printSide, setPrintSide] = useState<PrintSide>(PrintSide.Single);
  const [pageSize, setPageSize] = useState<PageSize>(PageSize.A4);
  const [totalPages, setTotalPages] = useState(1);
  const [pageRange, setPageRange] = useState("all");
  const [orientation, setOrientation] = useState("Portrait");
  const [price, setPrice] = useState<bigint | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const { data: printers } = useQuery({
    queryKey: ["printers"],
    queryFn: () => actor!.getAllPrinters(),
    enabled: !!actor,
  });

  const workingPrinters =
    printers?.filter((p) => p.status === PrinterStatus.Working) ?? [];

  useEffect(() => {
    if (!actor || !state?.blob || !printerId) return;
    const job: PrintJob = {
      jobId: "",
      userId: "",
      printerId,
      fileBlob: state.blob,
      fileName: state.fileName,
      fileType: state.fileType,
      pagesCount: BigInt(totalPages),
      pagesPerCopyCount: BigInt(totalPages),
      copiesCount: BigInt(copies),
      colorMode,
      paperSize: pageSize,
      sidesCount: BigInt(printSide === PrintSide.Double ? 2 : 1),
      colorPagesCount: BigInt(colorMode === ColorMode.Color ? totalPages : 0),
      onlyBW: colorMode === ColorMode.BW,
      price: BigInt(0),
      status: PrintJobStatus.uploaded,
    };
    setCalcLoading(true);
    actor
      .calculatePrice(job)
      .then((p) => {
        setPrice(p);
      })
      .catch(() => {
        setPrice(null);
      })
      .finally(() => setCalcLoading(false));
  }, [
    actor,
    state,
    printerId,
    copies,
    colorMode,
    printSide,
    pageSize,
    totalPages,
  ]);

  const handleProceed = () => {
    if (!state?.blob || !printerId) return;
    navigate("/payment", {
      state: {
        blob: state.blob,
        fileName: state.fileName,
        fileType: state.fileType,
        printerId,
        copies,
        colorMode,
        pageSize,
        totalPages,
        pageRange,
        orientation,
        price: price ?? BigInt(0),
      },
    });
  };

  if (!state?.blob) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">No file selected.</p>
          <Button onClick={() => navigate("/upload")}>Upload a File</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-1">Print Settings</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Configure your print job for{" "}
          <span className="font-medium text-foreground">{state.fileName}</span>
        </p>

        <div className="flex flex-col gap-4">
          {/* Printer */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Select Printer</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={printerId} onValueChange={setPrinterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a printer..." />
                </SelectTrigger>
                <SelectContent>
                  {workingPrinters.map((p) => (
                    <SelectItem key={p.printerId} value={p.printerId}>
                      <div className="flex items-center gap-2">
                        <Printer className="w-3.5 h-3.5" />
                        {p.printerId}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Print Options</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Color Mode</Label>
                  <div className="flex gap-2">
                    {[ColorMode.BW, ColorMode.Color].map((m) => (
                      <button
                        type="button"
                        key={m}
                        className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${colorMode === m ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                        onClick={() => setColorMode(m)}
                      >
                        {m === ColorMode.BW ? "B&W" : "Color"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Print Side</Label>
                  <div className="flex gap-2">
                    {[PrintSide.Single, PrintSide.Double].map((s) => (
                      <button
                        type="button"
                        key={s}
                        className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${printSide === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                        onClick={() => setPrintSide(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Page Size</Label>
                  <div className="flex gap-2">
                    {[PageSize.A4, PageSize.A3].map((s) => (
                      <button
                        type="button"
                        key={s}
                        className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${pageSize === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                        onClick={() => setPageSize(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Orientation</Label>
                  <div className="flex gap-2">
                    {["Portrait", "Landscape"].map((o) => (
                      <button
                        type="button"
                        key={o}
                        className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${orientation === o ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                        onClick={() => setOrientation(o)}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="copies" className="text-xs">
                    Number of Copies
                  </Label>
                  <Input
                    id="copies"
                    type="number"
                    min={1}
                    max={99}
                    value={copies}
                    onChange={(e) => setCopies(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pages" className="text-xs">
                    Total Pages
                  </Label>
                  <Input
                    id="pages"
                    type="number"
                    min={1}
                    value={totalPages}
                    onChange={(e) => setTotalPages(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="range" className="text-xs">
                  Page Range
                </Label>
                <Input
                  id="range"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder='all or e.g. "1-5,7"'
                />
              </div>
            </CardContent>
          </Card>

          {/* Price */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-4 flex items-center justify-between">
              <span className="font-semibold text-sm">Estimated Total</span>
              <span className="text-xl font-bold text-primary">
                {calcLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : price !== null ? (
                  formatPrice(price)
                ) : (
                  "—"
                )}
              </span>
            </CardContent>
          </Card>

          <Button
            onClick={handleProceed}
            disabled={!printerId}
            className="w-full"
          >
            Proceed to Payment →
          </Button>
        </div>
      </main>
    </div>
  );
}
