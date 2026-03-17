import Iter "mo:core/Iter";
import Blob "mo:core/Blob";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import List "mo:core/List";
import Text "mo:core/Text";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data stores
  let printers = Map.empty<Text, Printer>();
  let users = Map.empty<Text, User>();
  let printJobs = Map.empty<Text, PrintJob>();
  let pricingRules = Map.empty<Text, PricingRule>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // File Management
  include MixinStorage();

  // Types
  type PrinterStatus = { #Working; #Offline; #OutOfPaper };
  type PrintJobStatus = { #uploaded; #readyToPrint };
  type ColorMode = { #BW; #Color };
  type PrintSide = { #Single; #Double };
  type PageSize = { #A4; #A3 };
  type UserRole = { #student; #admin };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    studentId : Text;
    department : Text;
    role : UserRole;
  };

  public type User = {
    userId : Text;
    name : Text;
    email : Text;
    phone : Text;
    studentId : Text;
    department : Text;
    role : UserRole;
    createdAt : Int;
  };

  public type Printer = {
    printerId : Text;
    status : PrinterStatus;
    queueCount : Nat;
  };

  public type PrintJob = {
    jobId : Text;
    fileBlob : Storage.ExternalBlob;
    colorMode : ColorMode;
    status : PrintJobStatus;
    printerId : Text;
    fileType : ?Text;
    fileName : Text;
    userId : Text;
    pagesCount : Nat;
    sidesCount : Nat;
    copiesCount : Nat;
    price : Nat;
    paperSize : PageSize;
    pagesPerCopyCount : Nat;
    colorPagesCount : Nat;
    onlyBW : Bool;
  };

  public type PricingRule = {
    ruleId : Text;
    colorMode : ColorMode;
    pageSize : PageSize;
    printSide : PrintSide;
    pricePerPage : Nat;
  };

  module Printer {
    public func compare(p1 : Printer, p2 : Printer) : Order.Order {
      Text.compare(p1.printerId, p2.printerId);
    };
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // User Management
  public shared ({ caller }) func createUser(userId : Text, user : User) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create user records");
    };
    users.add(userId, user);
  };

  public query ({ caller }) func getUser(userId : Text) : async ?User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view user data");
    };
    users.get(userId);
  };

  // Pricing
  public shared ({ caller }) func calculatePrice(printJob : PrintJob) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can calculate prices");
    };
    let totalPages = printJob.pagesCount + printJob.sidesCount;
    let pricingRule = getPricingRule(printJob.colorMode, printJob.paperSize);
    totalPages * pricingRule.pricePerPage;
  };

  func getPricingRule(colorMode : ColorMode, pageSize : PageSize) : PricingRule {
    let ruleId = getRuleId(colorMode, pageSize);
    switch (pricingRules.get(ruleId)) {
      case (null) { Runtime.trap("Requested pricing rule does not exist") };
      case (?rule) { rule };
    };
  };

  func getRuleId(colorMode : ColorMode, pageSize : PageSize) : Text {
    let colorText = switch (colorMode) {
      case (#BW) { "BW" };
      case (#Color) { "Color" };
    };
    let sizeText = switch (pageSize) {
      case (#A4) { "A4" };
      case (#A3) { "A3" };
    };
    colorText # "_X_" # sizeText;
  };

  // Print Jobs
  public shared ({ caller }) func createPrintJob(jobId : Text, printJob : PrintJob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create print jobs");
    };
    
    // Verify the caller is creating a job for themselves
    let callerText = caller.toText();
    if (printJob.userId != callerText) {
      Runtime.trap("Unauthorized: Can only create print jobs for yourself");
    };
    
    printJobs.add(jobId, printJob);
  };

  public query ({ caller }) func getPrintJob(jobId : Text) : async ?PrintJob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view print jobs");
    };
    
    let job = printJobs.get(jobId);
    
    // Users can only view their own jobs, admins can view all
    switch (job) {
      case (null) { null };
      case (?j) {
        let callerText = caller.toText();
        if (j.userId != callerText and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own print jobs");
        };
        job;
      };
    };
  };

  public query ({ caller }) func getAllPrintJobs() : async [PrintJob] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view print jobs");
    };
    
    let callerText = caller.toText();
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    
    // Users see only their jobs, admins see all
    if (isAdmin) {
      printJobs.values().toArray();
    } else {
      printJobs.values().toArray().filter(func(job : PrintJob) : Bool {
        job.userId == callerText;
      });
    };
  };

  // Printer Management (Admin only)
  public shared ({ caller }) func updatePrinterStatus(printerId : Text, status : PrinterStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update printer status");
    };
    
    let updatedPrinter = {
      printerId;
      status;
      queueCount = 0;
    };
    printers.add(printerId, updatedPrinter);
  };

  public shared ({ caller }) func createPrinter(printer : Printer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create printers");
    };
    printers.add(printer.printerId, printer);
  };

  public shared ({ caller }) func deletePrinter(printerId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete printers");
    };
    printers.remove(printerId);
  };

  public query ({ caller }) func getAllPrinters() : async [Printer] {
    // All authenticated users can view printers
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view printers");
    };
    printers.values().toArray().sort();
  };

  public query ({ caller }) func getPrinter(printerId : Text) : async ?Printer {
    // All authenticated users can view printers
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view printers");
    };
    printers.get(printerId);
  };

  // Pricing Rules (Admin only for modifications, users can read)
  public shared ({ caller }) func addDefaultPricingRules() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add pricing rules");
    };
    
    pricingRules.add("BW_X_A4", { 
      ruleId = "BW_X_A4"; 
      pricePerPage = 1; 
      colorMode = #BW; 
      pageSize = #A4; 
      printSide = #Double 
    });
    pricingRules.add("BW_X_A3", { 
      ruleId = "BW_X_A3"; 
      pricePerPage = 2; 
      colorMode = #BW; 
      pageSize = #A3; 
      printSide = #Double 
    });
    pricingRules.add("Color_X_A4", { 
      ruleId = "Color_X_A4"; 
      pricePerPage = 3; 
      colorMode = #Color; 
      pageSize = #A4; 
      printSide = #Double 
    });
    pricingRules.add("Color_X_A3", { 
      ruleId = "Color_X_A3"; 
      pricePerPage = 4; 
      colorMode = #Color; 
      pageSize = #A3; 
      printSide = #Double 
    });
  };

  public shared ({ caller }) func addPricingRule(rule : PricingRule) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add pricing rules");
    };
    pricingRules.add(rule.ruleId, rule);
  };

  public shared ({ caller }) func updatePricingRule(ruleId : Text, rule : PricingRule) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update pricing rules");
    };
    pricingRules.add(ruleId, rule);
  };

  public shared ({ caller }) func deletePricingRule(ruleId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete pricing rules");
    };
    pricingRules.remove(ruleId);
  };

  public query ({ caller }) func getAllPricingRules() : async [PricingRule] {
    // All authenticated users can view pricing rules
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view pricing rules");
    };
    pricingRules.values().toArray();
  };

  public query ({ caller }) func getPricingRuleById(ruleId : Text) : async ?PricingRule {
    // All authenticated users can view pricing rules
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view pricing rules");
    };
    pricingRules.get(ruleId);
  };

  // Admin Analytics
  public query ({ caller }) func getTotalPrintJobs() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    printJobs.size();
  };

  public query ({ caller }) func getTotalRevenue() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    var total = 0;
    for (job in printJobs.values()) {
      total += job.price;
    };
    total;
  };
};
