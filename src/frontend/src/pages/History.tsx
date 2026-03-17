import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrintJobStatus } from "../backend";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  [PrintJobStatus.uploaded]: { label: "Uploaded", variant: "secondary" },
  [PrintJobStatus.readyToPrint]: {
    label: "Ready to Print",
    variant: "default",
  },
};

export default function History() {
  const { actor } = useActor();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");

  const {
    data: jobs,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => actor!.getAllPrintJobs(),
    enabled: !!actor,
  });

  const filtered =
    jobs?.filter((j) => filter === "all" || j.status === filter) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Print History</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              All your print jobs
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", PrintJobStatus.uploaded, PrintJobStatus.readyToPrint].map(
            (f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {f === "all" ? "All Jobs" : (statusConfig[f]?.label ?? f)}
              </button>
            ),
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/40" />
            <div>
              <p className="font-medium text-muted-foreground">
                No print jobs found
              </p>
              <p className="text-sm text-muted-foreground/60">
                Start by uploading a document
              </p>
            </div>
            <Button onClick={() => navigate("/upload")}>Upload Document</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((job) => {
              const cfg = statusConfig[job.status] ?? {
                label: job.status,
                variant: "secondary" as const,
              };
              const nameParts = job.fileName.split("::");
              const displayName =
                nameParts.length > 1 ? nameParts[1] : job.fileName;
              return (
                <Card key={job.jobId}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {job.printerId}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Number(job.pagesCount)} pages ·{" "}
                            {Number(job.copiesCount)} copies · {job.colorMode} ·{" "}
                            {job.paperSize}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        <span className="text-xs font-semibold text-primary">
                          ₹{(Number(job.price) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
