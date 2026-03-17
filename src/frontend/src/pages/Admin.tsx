import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ColorMode, PageSize, PrintSide, PrinterStatus } from "../backend";
import type { PricingRule, Printer } from "../backend";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";

const statusColors = {
  [PrinterStatus.Working]: "default",
  [PrinterStatus.OutOfPaper]: "secondary",
  [PrinterStatus.Offline]: "destructive",
} as const;

export default function Admin() {
  const { actor } = useActor();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor,
  });

  const { data: printers, isLoading: loadingPrinters } = useQuery({
    queryKey: ["printers"],
    queryFn: () => actor!.getAllPrinters(),
    enabled: !!actor && isAdmin === true,
  });

  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => actor!.getAllPrintJobs(),
    enabled: !!actor && isAdmin === true,
  });

  const { data: rules, isLoading: loadingRules } = useQuery({
    queryKey: ["rules"],
    queryFn: () => actor!.getAllPricingRules(),
    enabled: !!actor && isAdmin === true,
  });

  const { data: totalJobs } = useQuery({
    queryKey: ["totalJobs"],
    queryFn: () => actor!.getTotalPrintJobs(),
    enabled: !!actor && isAdmin === true,
  });

  const { data: totalRevenue } = useQuery({
    queryKey: ["totalRevenue"],
    queryFn: () => actor!.getTotalRevenue(),
    enabled: !!actor && isAdmin === true,
  });

  // New printer form
  const [newPrinterId, setNewPrinterId] = useState("");
  const [newPrinterStatus, setNewPrinterStatus] = useState<PrinterStatus>(
    PrinterStatus.Working,
  );

  // New rule form
  const [newRule, setNewRule] = useState({
    colorMode: ColorMode.BW,
    pageSize: PageSize.A4,
    printSide: PrintSide.Single,
    pricePerPage: "",
  });

  const addPrinterMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      const printer: Printer = {
        printerId: newPrinterId,
        status: newPrinterStatus,
        queueCount: BigInt(0),
      };
      await actor.createPrinter(printer);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["printers"] });
      setNewPrinterId("");
      toast.success("Printer added");
    },
    onError: () => toast.error("Failed to add printer"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      printerId,
      status,
    }: { printerId: string; status: PrinterStatus }) => {
      await actor!.updatePrinterStatus(printerId, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["printers"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deletePrinterMutation = useMutation({
    mutationFn: async (printerId: string) => {
      await actor!.deletePrinter(printerId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["printers"] });
      toast.success("Printer removed");
    },
    onError: () => toast.error("Failed to delete printer"),
  });

  const addRuleMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return;
      const rule: PricingRule = {
        ruleId: crypto.randomUUID(),
        colorMode: newRule.colorMode,
        pageSize: newRule.pageSize,
        printSide: newRule.printSide,
        pricePerPage: BigInt(
          Math.round(Number.parseFloat(newRule.pricePerPage) * 100),
        ),
      };
      await actor.addPricingRule(rule);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rules"] });
      setNewRule((r) => ({ ...r, pricePerPage: "" }));
      toast.success("Rule added");
    },
    onError: () => toast.error("Failed to add rule"),
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      await actor!.deletePricingRule(ruleId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rules"] });
      toast.success("Rule deleted");
    },
    onError: () => toast.error("Failed to delete rule"),
  });

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground font-medium">
            Admin access required
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Print Jobs</p>
              <p className="text-2xl font-bold mt-1">
                {totalJobs !== undefined ? Number(totalJobs) : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold mt-1 text-primary">
                {totalRevenue !== undefined
                  ? `₹${(Number(totalRevenue) / 100).toFixed(2)}`
                  : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Active Printers</p>
              <p className="text-2xl font-bold mt-1">
                {printers?.filter((p) => p.status === PrinterStatus.Working)
                  .length ?? "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="printers">
          <TabsList className="mb-6">
            <TabsTrigger value="printers">Printers</TabsTrigger>
            <TabsTrigger value="jobs">All Jobs</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Rules</TabsTrigger>
          </TabsList>

          {/* Printers Tab */}
          <TabsContent value="printers">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Add Printer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 flex-wrap">
                  <Input
                    placeholder="Printer ID / Location name"
                    value={newPrinterId}
                    onChange={(e) => setNewPrinterId(e.target.value)}
                    className="flex-1 min-w-[180px]"
                  />
                  <Select
                    value={newPrinterStatus}
                    onValueChange={(v) =>
                      setNewPrinterStatus(v as PrinterStatus)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PrinterStatus.Working}>
                        Working
                      </SelectItem>
                      <SelectItem value={PrinterStatus.OutOfPaper}>
                        Out of Paper
                      </SelectItem>
                      <SelectItem value={PrinterStatus.Offline}>
                        Offline
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => addPrinterMutation.mutate()}
                    disabled={!newPrinterId || addPrinterMutation.isPending}
                  >
                    {addPrinterMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {loadingPrinters ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {(printers ?? []).map((printer) => (
                  <Card key={printer.printerId}>
                    <CardContent className="pt-4 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-semibold text-sm">
                          {printer.printerId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Queue: {Number(printer.queueCount)} jobs
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={statusColors[printer.status]}>
                          {printer.status}
                        </Badge>
                        {(
                          [
                            PrinterStatus.Working,
                            PrinterStatus.OutOfPaper,
                            PrinterStatus.Offline,
                          ] as PrinterStatus[]
                        ).map(
                          (s) =>
                            printer.status !== s && (
                              <Button
                                key={s}
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    printerId: printer.printerId,
                                    status: s,
                                  })
                                }
                              >
                                Set {s}
                              </Button>
                            ),
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive h-7"
                          onClick={() =>
                            deletePrinterMutation.mutate(printer.printerId)
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            {loadingJobs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Printer</TableHead>
                        <TableHead>Pages</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(jobs ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-muted-foreground py-8"
                          >
                            No jobs yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        (jobs ?? []).map((job) => {
                          const nameParts = job.fileName.split("::");
                          const displayName =
                            nameParts.length > 1 ? nameParts[1] : job.fileName;
                          return (
                            <TableRow key={job.jobId}>
                              <TableCell className="font-medium max-w-[150px] truncate">
                                {displayName}
                              </TableCell>
                              <TableCell className="text-sm">
                                {job.printerId}
                              </TableCell>
                              <TableCell className="text-sm">
                                {Number(job.pagesCount)} ×{" "}
                                {Number(job.copiesCount)}
                              </TableCell>
                              <TableCell className="text-sm font-semibold">
                                ₹{(Number(job.price) / 100).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {job.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pricing Rules Tab */}
          <TabsContent value="pricing">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Add Pricing Rule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Color Mode</Label>
                    <Select
                      value={newRule.colorMode}
                      onValueChange={(v) =>
                        setNewRule((r) => ({ ...r, colorMode: v as ColorMode }))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ColorMode.BW}>B&W</SelectItem>
                        <SelectItem value={ColorMode.Color}>Color</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Page Size</Label>
                    <Select
                      value={newRule.pageSize}
                      onValueChange={(v) =>
                        setNewRule((r) => ({ ...r, pageSize: v as PageSize }))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PageSize.A4}>A4</SelectItem>
                        <SelectItem value={PageSize.A3}>A3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Print Side</Label>
                    <Select
                      value={newRule.printSide}
                      onValueChange={(v) =>
                        setNewRule((r) => ({ ...r, printSide: v as PrintSide }))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PrintSide.Single}>Single</SelectItem>
                        <SelectItem value={PrintSide.Double}>Double</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Price/Page (₹)</Label>
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      min="0"
                      step="0.5"
                      value={newRule.pricePerPage}
                      onChange={(e) =>
                        setNewRule((r) => ({
                          ...r,
                          pricePerPage: e.target.value,
                        }))
                      }
                      placeholder="e.g. 1.50"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => addRuleMutation.mutate()}
                  disabled={!newRule.pricePerPage || addRuleMutation.isPending}
                >
                  {addRuleMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Add Rule
                </Button>
              </CardContent>
            </Card>

            {loadingRules ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Color Mode</TableHead>
                        <TableHead>Page Size</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead>Price/Page</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(rules ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-muted-foreground py-8"
                          >
                            No pricing rules yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        (rules ?? []).map((rule) => (
                          <TableRow key={rule.ruleId}>
                            <TableCell>{rule.colorMode}</TableCell>
                            <TableCell>{rule.pageSize}</TableCell>
                            <TableCell>{rule.printSide}</TableCell>
                            <TableCell className="font-semibold">
                              ₹{(Number(rule.pricePerPage) / 100).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive h-7 px-2"
                                onClick={() =>
                                  deleteRuleMutation.mutate(rule.ruleId)
                                }
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
