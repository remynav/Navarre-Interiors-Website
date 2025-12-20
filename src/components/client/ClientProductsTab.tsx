import { useState, useEffect } from "react";
import {
  Package,
  Paintbrush,
  Sofa,
  Lamp,
  Wrench,
  ImageIcon,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageLightbox } from "@/components/admin/ImageLightbox";

interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string | null;
  link: string | null;
  image_url: string | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("product_inventory")
          .select("*")
          .order("category", { ascending: true })
          .order("name", { ascending: true });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
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
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Products
        </h1>
        <p className="text-muted-foreground mt-1">
          Products selected for your project
        </p>
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
                    className="bg-background rounded-lg border border-border overflow-hidden hover:border-gold/50 transition-colors"
                  >
                    {/* Product Image */}
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

      <ImageLightbox
        open={!!lightboxImage}
        onOpenChange={(open) => !open && setLightboxImage(null)}
        imageUrl={lightboxImage || ""}
      />
    </div>
  );
};
