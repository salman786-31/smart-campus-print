import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PricingRule {
    colorMode: ColorMode;
    ruleId: string;
    pageSize: PageSize;
    pricePerPage: bigint;
    printSide: PrintSide;
}
export interface UserProfile {
    studentId: string;
    name: string;
    role: UserRole;
    email: string;
    phone: string;
    department: string;
}
export interface User {
    studentId: string;
    userId: string;
    name: string;
    createdAt: bigint;
    role: UserRole;
    email: string;
    phone: string;
    department: string;
}
export interface PrintJob {
    status: PrintJobStatus;
    colorMode: ColorMode;
    copiesCount: bigint;
    userId: string;
    pagesPerCopyCount: bigint;
    pagesCount: bigint;
    jobId: string;
    fileBlob: ExternalBlob;
    fileName: string;
    paperSize: PageSize;
    fileType?: string;
    sidesCount: bigint;
    colorPagesCount: bigint;
    price: bigint;
    printerId: string;
    onlyBW: boolean;
}
export interface Printer {
    status: PrinterStatus;
    queueCount: bigint;
    printerId: string;
}
export enum ColorMode {
    BW = "BW",
    Color = "Color"
}
export enum PageSize {
    A3 = "A3",
    A4 = "A4"
}
export enum PrintJobStatus {
    uploaded = "uploaded",
    readyToPrint = "readyToPrint"
}
export enum PrintSide {
    Double = "Double",
    Single = "Single"
}
export enum PrinterStatus {
    Working = "Working",
    OutOfPaper = "OutOfPaper",
    Offline = "Offline"
}
export enum UserRole {
    admin = "admin",
    student = "student"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDefaultPricingRules(): Promise<void>;
    addPricingRule(rule: PricingRule): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    calculatePrice(printJob: PrintJob): Promise<bigint>;
    createPrintJob(jobId: string, printJob: PrintJob): Promise<void>;
    createPrinter(printer: Printer): Promise<void>;
    createUser(userId: string, user: User): Promise<void>;
    deletePricingRule(ruleId: string): Promise<void>;
    deletePrinter(printerId: string): Promise<void>;
    getAllPricingRules(): Promise<Array<PricingRule>>;
    getAllPrintJobs(): Promise<Array<PrintJob>>;
    getAllPrinters(): Promise<Array<Printer>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getPricingRuleById(ruleId: string): Promise<PricingRule | null>;
    getPrintJob(jobId: string): Promise<PrintJob | null>;
    getPrinter(printerId: string): Promise<Printer | null>;
    getTotalPrintJobs(): Promise<bigint>;
    getTotalRevenue(): Promise<bigint>;
    getUser(userId: string): Promise<User | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updatePricingRule(ruleId: string, rule: PricingRule): Promise<void>;
    updatePrinterStatus(printerId: string, status: PrinterStatus): Promise<void>;
}
