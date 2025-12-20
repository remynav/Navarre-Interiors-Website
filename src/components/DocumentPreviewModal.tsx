import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileText, Download, Send } from "lucide-react";

interface Document {
  id: number;
  name: string;
  size: string;
  type: string;
  date: string;
  data?: string;
  status: "draft" | "sent" | "archived";
}

interface DocumentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | undefined;
  onDownload: (doc: Document) => void;
  onSend?: (docId: number) => void;
  isAdmin?: boolean;
}

export const DocumentPreviewModal = ({
  open,
  onOpenChange,
  document,
  onDownload,
  onSend,
  isAdmin = false,
}: DocumentPreviewModalProps) => {
  if (!document) return null;

  const handleDownload = () => {
    onDownload(document);
  };

  const handleSend = () => {
    if (onSend) {
      onSend(document.id);
      onOpenChange(false);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-500/10 text-green-600";
      case "archived":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-gold/10 text-gold";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "sent":
        return "Sent";
      case "archived":
        return "Archived";
      default:
        return "Draft";
    }
  };

  const canPreview = document.data && document.type === "PDF";
  const isImage = document.type && ["JPG", "JPEG", "PNG", "GIF", "WEBP"].includes(document.type.toUpperCase());
  const canPreviewImage = document.data && isImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-3">
            <FileText className="w-5 h-5 text-gold" />
            {document.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto py-4">
          {canPreview ? (
            <div className="border border-border rounded-lg overflow-hidden">
              <iframe
                src={document.data}
                className="w-full h-[400px]"
                title="Document Preview"
              />
            </div>
          ) : canPreviewImage ? (
            <div className="border border-border rounded-lg overflow-hidden flex items-center justify-center bg-muted/30">
              <img
                src={document.data}
                alt={document.name}
                className="max-w-full max-h-[400px] object-contain"
              />
            </div>
          ) : document.data ? (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Preview not available for {document.type} files
              </p>
              <Button variant="gold" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download to View
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                This is a sample document without file data
              </p>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {document.size} • {document.date}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                document.status
              )}`}
            >
              {getStatusLabel(document.status)}
            </span>
          </div>
        </div>
        <DialogFooter className="gap-2">
          {isAdmin && document.status === "draft" && onSend && (
            <Button variant="gold" onClick={handleSend}>
              <Send className="w-4 h-4 mr-2" />
              Send to Client
            </Button>
          )}
          {document.data && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
