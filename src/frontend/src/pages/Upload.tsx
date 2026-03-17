import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  File,
  Loader2,
  Upload as UploadIcon,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import Navbar from "../components/Navbar";

const ACCEPTED = ".pdf,.docx,.doc,.png,.jpg,.jpeg";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Upload() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [blob, setBlob] = useState<ExternalBlob | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    setFileName(f.name);
    setUploaded(false);
    setBlob(null);
    setProgress(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const externalBlob = ExternalBlob.fromBytes(bytes).withUploadProgress(
        (pct) => setProgress(pct),
      );
      setBlob(externalBlob);
      setUploaded(true);
      toast.success("File uploaded successfully");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleConfigure = () => {
    if (!blob || !file) return;
    navigate("/configure", {
      state: { blob, fileName, fileType: file.type, fileSize: file.size },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-1">Upload Document</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Upload your file to get started with printing.
        </p>

        {/* Drop zone */}
        <label
          htmlFor="fileInput"
          className={`block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4 ${dragging ? "border-primary bg-accent" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <File className="w-10 h-10 text-primary" />
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatSize(file.size)} · {file.type || "Unknown type"}
              </p>
              <button
                type="button"
                className="text-xs text-destructive flex items-center gap-1 mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setUploaded(false);
                  setBlob(null);
                }}
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <UploadIcon className="w-10 h-10" />
              <div>
                <p className="font-medium text-sm text-foreground">
                  Drop file here or click to browse
                </p>
                <p className="text-xs mt-1">PDF, DOCX, PNG, JPG up to 50MB</p>
              </div>
            </div>
          )}
        </label>
        <input
          ref={inputRef}
          id="fileInput"
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {/* Rename */}
        {file && !uploaded && (
          <Card className="mb-4">
            <CardContent className="pt-4">
              <Label htmlFor="fname" className="text-sm">
                File name (optional rename)
              </Label>
              <Input
                id="fname"
                className="mt-1.5"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </CardContent>
          </Card>
        )}

        {/* Upload progress */}
        {uploading && (
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {progress.toFixed(0)}% uploaded
            </p>
          </div>
        )}

        {/* Uploaded success */}
        {uploaded && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">File ready for printing</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {file && !uploaded && (
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
          )}
          {uploaded && (
            <Button onClick={handleConfigure} className="w-full">
              Configure Print Settings →
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
