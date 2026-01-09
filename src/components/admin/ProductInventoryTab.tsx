import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  Paintbrush,
  Sofa,
  Lamp,
  Wrench,
  ImageIcon,
  Search,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductModal } from "./ProductModal";
import { ImageLightbox } from "./ImageLightbox";

interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string | null;
  link: string | null;
  image_url: string | null;
  price: number | null;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Fixtures": Wrench,
  "Paint Colors": Paintbrush,
  "Furniture": Sofa,
  "Lighting": Lamp,
  "Textiles & Rugs": Package,
};

export const ProductInventoryTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from("product_inventory")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (productsError) throw productsError;

      setProducts(productsData || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("product_inventory")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleModalClose = (open: boolean) => {
    setShowModal(open);
    if (!open) {
      setEditingProduct(null);
    }
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.supplier && product.supplier.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  // Group filtered products by category
  const productsByCategory = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [filteredProducts]);

  const categories = Object.keys(productsByCategory).sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Product Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Track products used across all projects
          </p>
        </div>
        <Button variant="gold" onClick={handleAddProduct}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, category, or supplier..."
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Overview */}
      {products.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.keys(
            products.reduce((acc, p) => ({ ...acc, [p.category]: true }), {} as Record<string, boolean>)
          ).sort().map((category) => {
            const IconComponent = CATEGORY_ICONS[category] || Package;
            const count = products.filter((p) => p.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSearchQuery(category)}
                className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border hover:border-gold transition-colors"
              >
                <IconComponent className="w-4 h-4 text-gold" />
                <span className="text-sm font-medium text-foreground">{category}</span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search Results Info */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          Found {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} matching "{searchQuery}"
        </p>
      )}

      {/* Products by Category */}
      {products.length === 0 ? (
        <div className="bg-card rounded-lg p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            No products yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Add your first product to get started
          </p>
          <Button variant="gold" onClick={handleAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-card rounded-lg p-12 text-center">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            No products found
          </h3>
          <p className="text-muted-foreground mb-4">
            Try a different search term
          </p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </div>
      ) : (
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground w-16">
                          Image
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Product Name
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Price
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Supplier
                        </th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4">
                            {product.image_url ? (
                              <button
                                onClick={() => setLightboxImage(product.image_url)}
                                className="w-12 h-12 rounded-lg overflow-hidden hover:ring-2 hover:ring-gold transition-all"
                              >
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {product.link ? (
                              <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-gold hover:underline"
                              >
                                {product.name}
                              </a>
                            ) : (
                              <p className="font-medium text-foreground">{product.name}</p>
                            )}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {product.price ? `$${product.price.toLocaleString()}` : "—"}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {product.supplier || "—"}
                          </td>
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {product.link && (
                                  <DropdownMenuItem
                                    onClick={() => window.open(product.link!, "_blank")}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Product
                                  </DropdownMenuItem>
                                )}
                                {product.image_url && (
                                  <DropdownMenuItem
                                    onClick={() => setLightboxImage(product.image_url)}
                                  >
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    View Image
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProductModal
        open={showModal}
        onOpenChange={handleModalClose}
        onProductSaved={fetchProducts}
        product={editingProduct}
      />

      <ImageLightbox
        open={!!lightboxImage}
        onOpenChange={(open) => !open && setLightboxImage(null)}
        imageUrl={lightboxImage || ""}
      />
    </div>
  );
};
