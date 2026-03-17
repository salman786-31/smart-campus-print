import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { FileText, History, Loader2, Printer, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PrinterStatus } from "../backend";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";

const statusConfig = {
  [PrinterStatus.Working]: {
    label: "Available",
    className: "bg-green-50 text-green-700 border border-green-200",
  },
  [PrinterStatus.OutOfPaper]: {
    label: "Out of Paper",
    className: "bg-orange-50 text-orange-700 border border-orange-200",
  },
  [PrinterStatus.Offline]: {
    label: "Offline",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { actor } = useActor();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => actor!.getCallerUserProfile(),
    enabled: !!actor,
  });

  const { data: printers, isLoading: loadingPrinters } = useQuery({
    queryKey: ["printers"],
    queryFn: () => actor!.getAllPrinters(),
    enabled: !!actor,
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => actor!.getAllPrintJobs(),
    enabled: !!actor,
  });

  const recentJobs = jobs?.slice(0, 3) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl font-bold">
            Welcome{profile?.name ? `, ${profile.name}` : ""}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            What would you like to print today?
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Upload,
              title: "Upload & Print",
              desc: "Start a new print job",
              href: "/upload",
              primary: true,
            },
            {
              icon: History,
              title: "Print History",
              desc: "View past jobs",
              href: "/history",
              primary: false,
            },
            {
              icon: FileText,
              title: "Track Jobs",
              desc: "Check job status",
              href: "/history",
              primary: false,
            },
          ].map((action) => (
            <Card
              key={action.title}
              className={`cursor-pointer hover:shadow-md transition-shadow ${action.primary ? "border-primary/30 bg-primary/5" : ""}`}
              onClick={() => navigate(action.href)}
            >
              <CardContent className="pt-5 flex flex-col gap-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.primary ? "bg-primary" : "bg-muted"}`}
                >
                  <action.icon
                    className={`w-4 h-4 ${action.primary ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                </div>
                <p className="font-semibold text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Printer Status */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Campus Printers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPrinters ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(printers ?? []).map((printer) => {
                  const cfg =
                    statusConfig[printer.status] ??
                    statusConfig[PrinterStatus.Offline];
                  return (
                    <div
                      key={printer.printerId}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {printer.printerId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Queue: {Number(printer.queueCount)} jobs
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
                {(!printers || printers.length === 0) && (
                  <p className="text-sm text-muted-foreground col-span-2 text-center py-4">
                    No printers available
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        {recentJobs.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Jobs</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/history")}
                >
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {recentJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium text-sm truncate max-w-[180px]">
                      {job.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.printerId}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                    {job.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
