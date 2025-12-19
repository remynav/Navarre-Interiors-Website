import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: { name: string; size: string; type: string; data: string }) => void;
  accept?: string;
  className?: string;
}

export const FileUpload = ({ onFileSelect, accept = ".pdf,.doc,.docx,.xls,.xlsx", className = "" }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onFileSelect({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        data: result
      });
    };
    reader.readAsDataURL(file);
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [handleFile]);

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragging 
          ? "border-gold bg-gold/5" 
          : "border-border hover:border-gold/50 hover:bg-muted/50"
        }
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          {isDragging ? (
            <FileText className="w-6 h-6 text-gold" />
          ) : (
            <Upload className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {isDragging ? "Drop file here" : "Drag & drop a file"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse (PDF, DOC, XLS)
          </p>
        </div>
      </div>
    </div>
  );
};
