import { useState, useEffect } from "react";
import {
  Package,
  Paintbrush,
  Sofa,
  Lamp,
  Wrench,
  ImageIcon,
  ExternalLink,
  Heart,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ImageLightbox } from "@/components/admin/ImageLightbox";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string | null;
  link: string | null;
  image_url: string | null;
}

interface MoodBoard {
  id: string;
  name: string;
  project_id: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Fixtures": Wrench,
  "Paint Colors": Paintbrush,
  "Furniture": Sofa,
  "Lighting": Lamp,
  "Textiles & Rugs": Package,
};

export const ClientProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [moodBoards, setMoodBoards] = useState<MoodBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showAddToBoardModal, setShowAddToBoardModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from("product_inventory")
          .select("*")
          .order("category", { ascending: true })
          .order("name", { ascending: true });

        if (productsError) throw productsError;
        setProducts(productsData || []);

        // Fetch favorites
        if (user) {
          const { data: favoritesData, error: favoritesError } = await supabase
            .from("product_favorites")
            .select("product_id")
            .eq("user_id", user.id);

          if (!favoritesError && favoritesData) {
            setFavorites(new Set(favoritesData.map((f) => f.product_id)));
          }

          // Fetch mood boards
          const { data: boardsData, error: boardsError } = await supabase
            .from("mood_boards")
            .select("id, name, project_id")
            .order("name", { ascending: true });

          if (!boardsError && boardsData) {
            setMoodBoards(boardsData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleFavorite = async (productId: string) => {
    if (!currentUserId) return;

    const isFavorite = favorites.has(productId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("product_favorites")
          .delete()
          .eq("user_id", currentUserId)
          .eq("product_id", productId);

        if (error) throw error;

        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        toast.success("Removed from favorites");
      } else {
        const { error } = await supabase.from("product_favorites").insert({
          user_id: currentUserId,
          product_id: productId,
        });

        if (error) throw error;

        setFavorites((prev) => new Set([...prev, productId]));
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite");
    }
  };

  const handleAddToBoard = async () => {
    if (!selectedProduct || !selectedBoardId || !currentUserId) return;

    try {
      const { error } = await supabase.from("board_products").insert({
        mood_board_id: selectedBoardId,
        product_id: selectedProduct.id,
        added_by: currentUserId,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Product already added to this board");
        } else {
          throw error;
        }
      } else {
        toast.success("Product added to board");
        setShowAddToBoardModal(false);
        setSelectedProduct(null);
        setSelectedBoardId("");
      }
    } catch (error) {
      console.error("Error adding to board:", error);
      toast.error("Failed to add product to board");
    }
  };

  const openAddToBoardModal = (product: Product) => {
    setSelectedProduct(product);
    setShowAddToBoardModal(true);
  };

  // Filter products
  const displayedProducts = showFavoritesOnly
    ? products.filter((p) => favorites.has(p.id))
    : products;

  // Group products by category
  const productsByCategory = displayedProducts.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const categories = Object.keys(productsByCategory).sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Products
          </h1>
          <p className="text-muted-foreground mt-1">
            Products selected for your project
          </p>
        </div>
        <div className="bg-card rounded-lg p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            No products yet
          </h3>
          <p className="text-muted-foreground">
            Your designer will add products for your project soon
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Products
          </h1>
          <p className="text-muted-foreground mt-1">
            Products selected for your project
          </p>
        </div>
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="gap-2"
        >
          <Heart className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
          {showFavoritesOnly ? "Show All" : "Favorites Only"}
        </Button>
      </div>

      {/* Category Overview */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const IconComponent = CATEGORY_ICONS[category] || Package;
          return (
            <div
              key={category}
              className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border"
            >
              <IconComponent className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-foreground">{category}</span>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {productsByCategory[category].length}
              </span>
            </div>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        {categories.map((category) => {
          const IconComponent = CATEGORY_ICONS[category] || Package;
          const categoryProducts = productsByCategory[category];

          return (
            <div key={category} className="bg-card rounded-lg shadow-soft overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-3">
                <IconComponent className="w-5 h-5 text-gold" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {category}
                </h3>
                <span className="text-sm text-muted-foreground">
                  ({categoryProducts.length} items)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {categoryProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-background rounded-lg border border-border overflow-hidden hover:border-gold/50 transition-colors group"
                  >
                    {/* Product Image */}
                    <div className="relative">
                      {product.image_url ? (
                        <button
                          onClick={() => setLightboxImage(product.image_url)}
                          className="w-full aspect-square overflow-hidden hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <div className="w-full aspect-square bg-muted flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Action buttons overlay */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-background/90 hover:bg-background"
                          onClick={() => toggleFavorite(product.id)}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favorites.has(product.id)
                                ? "fill-red-500 text-red-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                        {moodBoards.length > 0 && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-background/90 hover:bg-background"
                            onClick={() => openAddToBoardModal(product)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4">
                      {product.link ? (
                        <a
                          href={product.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-gold transition-colors flex items-center gap-2"
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
          );
        })}
      </div>

      {showFavoritesOnly && displayedProducts.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No favorite products yet</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setShowFavoritesOnly(false)}
          >
            Browse all products
          </Button>
        </div>
      )}

      <ImageLightbox
        open={!!lightboxImage}
        onOpenChange={(open) => !open && setLightboxImage(null)}
        imageUrl={lightboxImage || ""}
      />

      {/* Add to Board Modal */}
      <Dialog open={showAddToBoardModal} onOpenChange={setShowAddToBoardModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Inspiration Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add <span className="font-medium text-foreground">{selectedProduct?.name}</span> to a board
            </p>
            <div>
              <Label>Select Board</Label>
              <Select value={selectedBoardId} onValueChange={setSelectedBoardId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a board..." />
                </SelectTrigger>
                <SelectContent>
                  {moodBoards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddToBoardModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToBoard} disabled={!selectedBoardId}>
              Add to Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
