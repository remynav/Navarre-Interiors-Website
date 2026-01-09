import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ImageUpload } from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string | null;
  link: string | null;
  image_url: string | null;
  price: number | null;
}

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductSaved: () => void;
  product?: Product | null; // If provided, we're editing
}

const DEFAULT_CATEGORIES = [
  "Fixtures",
  "Paint Colors",
  "Furniture",
  "Lighting",
  "Textiles & Rugs",
];

export const ProductModal = ({
  open,
  onOpenChange,
  onProductSaved,
  product,
}: ProductModalProps) => {
  const isEditing = !!product;
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    supplier: "",
    link: "",
    price: "",
  });

  // Fetch existing categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("product_inventory")
        .select("category");
      
      if (!error && data) {
        const dbCategories = [...new Set(data.map(p => p.category))];
        const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...dbCategories])].sort();
        setCategories(allCategories);
      }
    };
    
    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Reset form when modal opens or product changes
  useEffect(() => {
    if (open) {
      if (product) {
        setFormData({
          name: product.name,
          category: product.category,
          supplier: product.supplier || "",
          link: product.link || "",
          price: product.price?.toString() || "",
        });
        setImagePreview(product.image_url || "");
      } else {
        setFormData({
          name: "",
          category: "",
          supplier: "",
          link: "",
          price: "",
        });
        setImagePreview("");
      }
      setImageFile(null);
    }
  }, [open, product]);

  const handleImageChange = (value: string) => {
    setImagePreview(value);
    // Convert base64 to file for upload
    if (value && value.startsWith("data:")) {
      fetch(value)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "product-image.jpg", { type: "image/jpeg" });
          setImageFile(file);
        });
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) {
      toast.error("Please fill in required fields (Name and Category)");
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = isEditing ? product?.image_url || null : null;

      // Upload new image if provided
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          toast.error("Failed to upload image");
          setIsLoading(false);
          return;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      }

      const productData = {
        name: formData.name,
        category: formData.category,
        supplier: formData.supplier || null,
        link: formData.link || null,
        price: formData.price ? parseFloat(formData.price) : null,
        image_url: imageUrl,
      };

      if (isEditing && product) {
        // Update existing product
        const { error: updateError } = await supabase
          .from("product_inventory")
          .update(productData)
          .eq("id", product.id);

        if (updateError) {
          console.error("Update error:", updateError);
          toast.error("Failed to update product");
          setIsLoading(false);
          return;
        }

        toast.success("Product updated successfully!");
      } else {
        // Insert new product
        const { error: insertError } = await supabase
          .from("product_inventory")
          .insert(productData);

        if (insertError) {
          console.error("Insert error:", insertError);
          toast.error("Failed to add product");
          setIsLoading(false);
          return;
        }

        toast.success("Product added successfully!");
      }

      onOpenChange(false);
      onProductSaved();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(isEditing ? "Failed to update product" : "Failed to add product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-category">Category *</Label>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={categoryOpen}
                  className="w-full justify-between font-normal"
                >
                  {formData.category || "Select or add category..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search or add category..." 
                    value={categorySearch}
                    onValueChange={setCategorySearch}
                  />
                  <CommandList>
                    <CommandEmpty className="p-2">
                      {categorySearch && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setFormData({ ...formData, category: categorySearch });
                            setCategories(prev => [...new Set([...prev, categorySearch])].sort());
                            setCategorySearch("");
                            setCategoryOpen(false);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add "{categorySearch}"
                        </Button>
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {categories.map((cat) => (
                        <CommandItem
                          key={cat}
                          value={cat}
                          onSelect={() => {
                            setFormData({ ...formData, category: cat });
                            setCategoryOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.category === cat ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {cat}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-supplier">Supplier</Label>
            <Input
              id="product-supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="Enter supplier name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-link">Supplier Link</Label>
            <Input
              id="product-link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-price">Price</Label>
            <Input
              id="product-price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Product Image</Label>
            <ImageUpload
              value={imagePreview}
              onChange={handleImageChange}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditing ? "Saving..." : "Adding..."}
              </>
            ) : (
              isEditing ? "Save Changes" : "Add Product"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
