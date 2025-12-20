import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  Package,
  X,
  ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: number;
  sender: string;
  name?: string;
  text: string;
  time: string;
}

interface DesignItem {
  id: number;
  type: string;
  name: string;
  image: string;
  status: string;
  link?: string;
  commentsList: Comment[];
}

interface Inspiration {
  id: number;
  title: string;
  coverImage: string;
  notes: string;
  gallery: string[];
  designItems: DesignItem[];
}

interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string | null;
  link: string | null;
  image_url: string | null;
}

interface InspirationBoardsTabProps {
  inspirations: Inspiration[];
  setInspirations: (data: Inspiration[] | ((prev: Inspiration[]) => Inspiration[])) => void;
}

export const InspirationBoardsTab = ({
  inspirations,
  setInspirations,
}: InspirationBoardsTabProps) => {
  const [selectedBoard, setSelectedBoard] = useState<Inspiration | null>(null);
  const [activeTab, setActiveTab] = useState<"gallery" | "products">("gallery");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showItemComments, setShowItemComments] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch products when viewing a board
  useEffect(() => {
    if (selectedBoard && activeTab === "products") {
      setLoadingProducts(true);
      supabase
        .from("product_inventory")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching products:", error);
          } else {
            setProducts(data || []);
          }
          setLoadingProducts(false);
        });
    }
  }, [selectedBoard, activeTab]);

  const handleApproveItem = (itemId: number) => {
    if (!selectedBoard) return;
    setInspirations((prev) =>
      prev.map((board) =>
        board.id === selectedBoard.id
          ? {
              ...board,
              designItems: board.designItems.map((item) =>
                item.id === itemId ? { ...item, status: "approved" } : item
              ),
            }
          : board
      )
    );
    // Update local state
    setSelectedBoard((prev) =>
      prev
        ? {
            ...prev,
            designItems: prev.designItems.map((item) =>
              item.id === itemId ? { ...item, status: "approved" } : item
            ),
          }
        : null
    );
    toast.success("Item approved!");
  };

  const handleUndoApproval = (itemId: number) => {
    if (!selectedBoard) return;
    setInspirations((prev) =>
      prev.map((board) =>
        board.id === selectedBoard.id
          ? {
              ...board,
              designItems: board.designItems.map((item) =>
                item.id === itemId ? { ...item, status: "pending" } : item
              ),
            }
          : board
      )
    );
    setSelectedBoard((prev) =>
      prev
        ? {
            ...prev,
            designItems: prev.designItems.map((item) =>
              item.id === itemId ? { ...item, status: "pending" } : item
            ),
          }
        : null
    );
    toast.success("Approval undone");
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedBoard || !selectedItemId) return;
    
    const newCommentObj = {
      id: Date.now(),
      sender: "client",
      text: newComment,
      time: new Date().toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setInspirations((prev) =>
      prev.map((board) =>
        board.id === selectedBoard.id
          ? {
              ...board,
              designItems: board.designItems.map((item) =>
                item.id === selectedItemId
                  ? { ...item, commentsList: [...item.commentsList, newCommentObj] }
                  : item
              ),
            }
          : board
      )
    );
    setSelectedBoard((prev) =>
      prev
        ? {
            ...prev,
            designItems: prev.designItems.map((item) =>
              item.id === selectedItemId
                ? { ...item, commentsList: [...item.commentsList, newCommentObj] }
                : item
            ),
          }
        : null
    );
    setNewComment("");
    toast.success("Comment added");
  };

  const getSelectedItem = () =>
    selectedBoard?.designItems.find((item) => item.id === selectedItemId);

  // Board List View
  if (!selectedBoard) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Inspiration Boards
          </h1>
          <p className="text-muted-foreground mt-1">
            Design concepts and mood boards for your project
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {inspirations.map((board) => (
            <button
              key={board.id}
              onClick={() => {
                setSelectedBoard(board);
                setActiveTab("gallery");
              }}
              className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all text-left"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={board.coverImage}
                  alt={board.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-xl font-semibold text-white mb-1">
                    {board.title}
                  </h3>
                  <p className="text-white/80 text-sm line-clamp-1">{board.notes}</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {board.gallery.length} images
                </span>
                <span className="text-sm text-muted-foreground">
                  {board.designItems.length} selections
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Board Detail View
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedBoard(null)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            {selectedBoard.title}
          </h1>
          <p className="text-muted-foreground">{selectedBoard.notes}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setActiveTab("gallery")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "gallery"
              ? "border-gold text-gold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Gallery ({selectedBoard.gallery.length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "products"
              ? "border-gold text-gold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Products ({selectedBoard.designItems.length + products.length})
        </button>
      </div>

      {/* Gallery Tab - Pinterest Style */}
      {activeTab === "gallery" && (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {selectedBoard.gallery.map((image, index) => (
            <button
              key={index}
              onClick={() => setLightboxImage(image)}
              className="w-full break-inside-avoid overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
            >
              <img
                src={image}
                alt={`${selectedBoard.title} - Image ${index + 1}`}
                className="w-full h-auto object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-8">
          {/* Design Selections */}
          {selectedBoard.designItems.length > 0 && (
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Design Selections
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {selectedBoard.designItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card rounded-lg overflow-hidden border border-border hover:border-gold/50 transition-colors"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "approved"
                            ? "bg-green-500/90 text-white"
                            : "bg-gold/90 text-primary"
                        }`}
                      >
                        {item.status === "approved" ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {item.type}
                      </p>
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-gold transition-colors flex items-center gap-1 mt-1"
                        >
                          {item.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="font-medium text-foreground mt-1">{item.name}</p>
                      )}
                      <div className="flex gap-2 mt-3">
                        {item.status === "approved" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUndoApproval(item.id)}
                            className="flex-1 h-8 text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                            Undo
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveItem(item.id)}
                            className="flex-1 h-8 text-xs"
                          >
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedItemId(item.id);
                            setShowItemComments(true);
                          }}
                          className="h-8 text-xs"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {item.commentsList.length > 0 && (
                            <span className="ml-1">{item.commentsList.length}</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products from Inventory */}
          {loadingProducts ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
          ) : products.length > 0 ? (
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Product Inventory
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-card rounded-lg overflow-hidden border border-border hover:border-gold/50 transition-colors"
                  >
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-background/90 text-foreground">
                        {product.category}
                      </span>
                    </div>
                    <div className="p-4">
                      {product.link ? (
                        <a
                          href={product.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-gold transition-colors flex items-center gap-1"
                        >
                          {product.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="font-medium text-foreground">{product.name}</p>
                      )}
                      {product.supplier && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {product.supplier}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {selectedBoard.designItems.length === 0 && products.length === 0 && !loadingProducts && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products selected yet</p>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background rounded-full"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            {lightboxImage && (
              <img
                src={lightboxImage}
                alt="Gallery image"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Comments Modal */}
      <Dialog open={showItemComments} onOpenChange={setShowItemComments}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Comments - {getSelectedItem()?.name}
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-3">
              {getSelectedItem()?.commentsList.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No comments yet
                </p>
              ) : (
                getSelectedItem()?.commentsList.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg ${
                      comment.sender === "client"
                        ? "bg-gold/10 ml-4"
                        : "bg-muted mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">
                        {comment.sender === "client" ? "You" : comment.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {comment.time}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              />
              <Button variant="gold" onClick={handleAddComment}>
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
