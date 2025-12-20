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
  Plus,
  Upload,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/ImageUpload";

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

interface BoardProduct {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    category: string;
    supplier: string | null;
    link: string | null;
    image_url: string | null;
  };
}

interface ClientImage {
  id: string;
  image_url: string;
  uploaded_by: string;
}

interface InspirationBoardsTabProps {
  inspirations: Inspiration[];
  setInspirations: (data: Inspiration[] | ((prev: Inspiration[]) => Inspiration[])) => void;
  onAskQuestion?: (item: { type: string; id: number; title: string; image: string }) => void;
}

export const InspirationBoardsTab = ({
  inspirations,
  setInspirations,
  onAskQuestion,
}: InspirationBoardsTabProps) => {
  const [selectedBoard, setSelectedBoard] = useState<Inspiration | null>(null);
  const [activeTab, setActiveTab] = useState<"gallery" | "products">("gallery");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [boardProducts, setBoardProducts] = useState<BoardProduct[]>([]);
  const [clientImages, setClientImages] = useState<ClientImage[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Fetch board products and client images when viewing a board
  useEffect(() => {
    if (selectedBoard) {
      fetchBoardData();
    }
  }, [selectedBoard]);

  const fetchBoardData = async () => {
    if (!selectedBoard) return;
    
    setLoadingProducts(true);
    try {
      // Fetch board products
      const { data: productsData, error: productsError } = await supabase
        .from("board_products")
        .select(`
          id,
          product_id,
          product:product_inventory (
            id,
            name,
            category,
            supplier,
            link,
            image_url
          )
        `)
        .eq("mood_board_id", selectedBoard.id.toString());

      if (productsError) {
        console.error("Error fetching board products:", productsError);
      } else {
        setBoardProducts((productsData as unknown as BoardProduct[]) || []);
      }

      // Fetch client-uploaded images
      const { data: imagesData, error: imagesError } = await supabase
        .from("client_board_images")
        .select("*")
        .eq("mood_board_id", selectedBoard.id.toString())
        .order("created_at", { ascending: false });

      if (imagesError) {
        console.error("Error fetching client images:", imagesError);
      } else {
        setClientImages(imagesData || []);
      }
    } catch (error) {
      console.error("Error fetching board data:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddClientImage = async () => {
    if (!newImageUrl.trim() || !selectedBoard || !currentUserId) return;

    try {
      const { error } = await supabase
        .from("client_board_images")
        .insert({
          mood_board_id: selectedBoard.id.toString(),
          image_url: newImageUrl,
          uploaded_by: currentUserId,
        });

      if (error) throw error;

      setClientImages([
        { id: crypto.randomUUID(), image_url: newImageUrl, uploaded_by: currentUserId },
        ...clientImages,
      ]);
      setNewImageUrl("");
      setShowAddImageModal(false);
      toast.success("Image added to board");
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error("Failed to add image");
    }
  };

  const handleDeleteClientImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from("client_board_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      setClientImages(clientImages.filter((img) => img.id !== imageId));
      toast.success("Image removed");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to remove image");
    }
  };

  const handleRemoveProductFromBoard = async (boardProductId: string) => {
    try {
      const { error } = await supabase
        .from("board_products")
        .delete()
        .eq("id", boardProductId);

      if (error) throw error;

      setBoardProducts(boardProducts.filter((bp) => bp.id !== boardProductId));
      toast.success("Product removed from board");
    } catch (error) {
      console.error("Error removing product:", error);
      toast.error("Failed to remove product");
    }
  };

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

  const handleAskQuestion = (item: DesignItem) => {
    if (onAskQuestion) {
      onAskQuestion({
        type: 'design_item',
        id: item.id,
        title: `${item.type}: ${item.name}`,
        image: item.image,
      });
    }
  };

  // Combine gallery images with client-uploaded images
  const allGalleryImages = selectedBoard
    ? [...selectedBoard.gallery, ...clientImages.map((img) => img.image_url)]
    : [];

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
        <div className="flex-1">
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
          Gallery ({allGalleryImages.length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "products"
              ? "border-gold text-gold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Products ({selectedBoard.designItems.length + boardProducts.length})
        </button>
      </div>

      {/* Gallery Tab - Pinterest Style */}
      {activeTab === "gallery" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddImageModal(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Image
            </Button>
          </div>
          
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {/* Designer images */}
            {selectedBoard.gallery.map((image, index) => (
              <button
                key={`gallery-${index}`}
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
            
            {/* Client-uploaded images */}
            {clientImages.map((img) => (
              <div
                key={img.id}
                className="w-full break-inside-avoid overflow-hidden rounded-lg relative group"
              >
                <button
                  onClick={() => setLightboxImage(img.image_url)}
                  className="w-full hover:opacity-90 transition-opacity"
                >
                  <img
                    src={img.image_url}
                    alt="Client inspiration"
                    className="w-full h-auto object-cover"
                  />
                </button>
                {img.uploaded_by === currentUserId && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteClientImage(img.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs text-muted-foreground">
                  Your upload
                </span>
              </div>
            ))}
          </div>
          
          {allGalleryImages.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No images in this board yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowAddImageModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add your first image
              </Button>
            </div>
          )}
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
                          onClick={() => handleAskQuestion(item)}
                          className="h-8 text-xs"
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Ask Question
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Board Products */}
          {loadingProducts ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
          ) : boardProducts.length > 0 ? (
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Products for this Board
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {boardProducts.map((bp) => (
                  <div
                    key={bp.id}
                    className="bg-card rounded-lg overflow-hidden border border-border hover:border-gold/50 transition-colors group"
                  >
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      {bp.product.image_url ? (
                        <img
                          src={bp.product.image_url}
                          alt={bp.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-background/90 text-foreground">
                        {bp.product.category}
                      </span>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveProductFromBoard(bp.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="p-4">
                      {bp.product.link ? (
                        <a
                          href={bp.product.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-gold transition-colors flex items-center gap-1"
                        >
                          {bp.product.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="font-medium text-foreground">{bp.product.name}</p>
                      )}
                      {bp.product.supplier && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {bp.product.supplier}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {selectedBoard.designItems.length === 0 && boardProducts.length === 0 && !loadingProducts && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products selected for this board yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add products from the Products page
              </p>
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

      {/* Add Image Modal */}
      <Dialog open={showAddImageModal} onOpenChange={setShowAddImageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Inspiration Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
            </div>
            <ImageUpload
              value={newImageUrl}
              onChange={(url) => setNewImageUrl(url)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddImageModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClientImage} disabled={!newImageUrl.trim()}>
              Add Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
