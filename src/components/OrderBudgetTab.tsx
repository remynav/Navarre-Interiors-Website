import { useState, useEffect, forwardRef } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Upload,
  FileText,
  Download,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Order {
  id: string;
  project_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  supplier: string | null;
  order_date: string;
  expected_delivery: string | null;
  actual_delivery: string | null;
  notes: string | null;
  budget_category: string | null;
  receipt_url: string | null;
}

interface BudgetItem {
  id: string;
  project_id: string;
  category: string;
  description: string | null;
  allocated_amount: number;
  spent_amount: number;
}

interface InventoryProduct {
  id: string;
  name: string;
  category: string;
  supplier: string | null;
  link: string | null;
  image_url: string | null;
  price: number | null;
}

interface OrderBudgetTabProps {
  projectId: string | null;
  isAdmin: boolean;
}

type SortField = "product_name" | "budget_category" | "status" | "supplier" | "order_date";
type SortDirection = "asc" | "desc";

type ProductInputMode = "manual" | "inventory";

const BUDGET_COLORS = [
  "hsl(var(--gold))",
  "hsl(var(--primary))",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

const ORDER_STATUSES = ["pending", "ordered", "shipped", "delivered", "cancelled"];

export const OrderBudgetTab = forwardRef<HTMLDivElement, OrderBudgetTabProps>(({ projectId, isAdmin }, ref) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingBudget, setIsLoadingBudget] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("orders");
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Modal states
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);

  // Product input mode for orders
  const [productInputMode, setProductInputMode] = useState<ProductInputMode>("manual");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [newProductCategory, setNewProductCategory] = useState("");
  
  // Receipt upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // Form states
  const [orderForm, setOrderForm] = useState({
    product_name: "",
    quantity: 1,
    unit_price: 0,
    status: "pending",
    supplier: "",
    order_date: new Date().toISOString().split("T")[0],
    expected_delivery: "",
    notes: "",
    budget_category: "",
  });

  const [budgetForm, setBudgetForm] = useState({
    category: "",
    description: "",
    allocated_amount: 0,
  });

  // Fetch orders
  useEffect(() => {
    if (!projectId) return;

    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("project_id", projectId)
          .order("order_date", { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [projectId]);

  // Fetch budget items
  useEffect(() => {
    if (!projectId) return;

    const fetchBudget = async () => {
      setIsLoadingBudget(true);
      try {
        const { data, error } = await supabase
          .from("budget_items")
          .select("*")
          .eq("project_id", projectId)
          .order("category");

        if (error) throw error;
        setBudgetItems(data || []);
      } catch (error) {
        console.error("Error fetching budget:", error);
      } finally {
        setIsLoadingBudget(false);
      }
    };

    fetchBudget();
  }, [projectId]);

  // Fetch inventory products
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data, error } = await supabase
          .from("product_inventory")
          .select("id, name, category, supplier, link, image_url, price")
          .order("name");

        if (error) throw error;
        setInventoryProducts(data || []);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchInventory();
  }, []);

  // Handle product selection from inventory
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = inventoryProducts.find(p => p.id === productId);
    if (product) {
      setOrderForm(prev => ({
        ...prev,
        product_name: product.name,
        supplier: product.supplier || "",
      }));
    }
  };

  // Upload receipt to storage
  const uploadReceipt = async (file: File, orderId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}-${Date.now()}.${fileExt}`;
    const filePath = `${projectId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('order-receipts')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading receipt:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('order-receipts')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleAddOrder = async () => {
    if (!projectId || !orderForm.product_name.trim()) {
      toast.error("Please fill in product name");
      return;
    }

    try {
      setIsUploadingReceipt(!!receiptFile);

      // Check if product already exists in inventory (case-insensitive)
      const productExists = inventoryProducts.some(
        (p) => p.name.toLowerCase() === orderForm.product_name.trim().toLowerCase()
      );

      // If product doesn't exist and we're in manual mode, add it to inventory
      if (!productExists && productInputMode === "manual") {
        const { data: newProduct, error: inventoryError } = await supabase
          .from("product_inventory")
          .insert({
            name: orderForm.product_name.trim(),
            category: orderForm.budget_category || "Uncategorized",
            supplier: orderForm.supplier || null,
            project_id: projectId,
          })
          .select()
          .single();

        if (inventoryError) {
          console.error("Error adding to inventory:", inventoryError);
        } else if (newProduct) {
          setInventoryProducts(prev => [...prev, newProduct]);
        }
      }

      const { data, error } = await supabase
        .from("orders")
        .insert({
          project_id: projectId,
          product_name: orderForm.product_name,
          quantity: orderForm.quantity,
          unit_price: orderForm.unit_price,
          status: orderForm.status,
          supplier: orderForm.supplier || null,
          order_date: orderForm.order_date,
          expected_delivery: orderForm.expected_delivery || null,
          notes: orderForm.notes || null,
          budget_category: orderForm.budget_category || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload receipt if provided
      let receiptUrl: string | null = null;
      if (receiptFile && data) {
        receiptUrl = await uploadReceipt(receiptFile, data.id);
        if (receiptUrl) {
          await supabase
            .from("orders")
            .update({ receipt_url: receiptUrl })
            .eq("id", data.id);
        }
      }

      setOrders([{ ...data, receipt_url: receiptUrl }, ...orders]);
      setShowAddOrderModal(false);
      resetOrderForm();
      toast.success("Order added successfully");
    } catch (error) {
      console.error("Error adding order:", error);
      toast.error("Failed to add order");
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    try {
      setIsUploadingReceipt(!!receiptFile);

      // Upload new receipt if provided
      let receiptUrl = editingOrder.receipt_url;
      if (receiptFile) {
        receiptUrl = await uploadReceipt(receiptFile, editingOrder.id);
      }

      const { error } = await supabase
        .from("orders")
        .update({
          product_name: orderForm.product_name,
          quantity: orderForm.quantity,
          unit_price: orderForm.unit_price,
          status: orderForm.status,
          supplier: orderForm.supplier || null,
          expected_delivery: orderForm.expected_delivery || null,
          actual_delivery: orderForm.status === "delivered" ? new Date().toISOString().split("T")[0] : null,
          notes: orderForm.notes || null,
          budget_category: orderForm.budget_category || null,
          receipt_url: receiptUrl,
        })
        .eq("id", editingOrder.id);

      if (error) throw error;

      setOrders(
        orders.map((o) =>
          o.id === editingOrder.id
            ? {
                ...o,
                product_name: orderForm.product_name,
                quantity: orderForm.quantity,
                unit_price: orderForm.unit_price,
                total_price: orderForm.quantity * orderForm.unit_price,
                status: orderForm.status,
                supplier: orderForm.supplier || null,
                expected_delivery: orderForm.expected_delivery || null,
                actual_delivery: orderForm.status === "delivered" ? new Date().toISOString().split("T")[0] : null,
                notes: orderForm.notes || null,
                budget_category: orderForm.budget_category || null,
                receipt_url: receiptUrl,
              }
            : o
        )
      );
      setEditingOrder(null);
      resetOrderForm();
      toast.success("Order updated successfully");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase.from("orders").delete().eq("id", orderId);

      if (error) throw error;

      setOrders(orders.filter((o) => o.id !== orderId));
      toast.success("Order deleted");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  // Budget handlers
  const handleAddBudget = async () => {
    if (!projectId || !budgetForm.category.trim()) {
      toast.error("Please fill in category");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("budget_items")
        .insert({
          project_id: projectId,
          category: budgetForm.category,
          description: budgetForm.description || null,
          allocated_amount: budgetForm.allocated_amount,
          spent_amount: 0, // Spent amount is calculated from orders
        })
        .select()
        .single();

      if (error) throw error;

      setBudgetItems([...budgetItems, data]);
      setShowAddBudgetModal(false);
      resetBudgetForm();
      toast.success("Budget item added successfully");
    } catch (error) {
      console.error("Error adding budget item:", error);
      toast.error("Failed to add budget item");
    }
  };

  const handleUpdateBudget = async () => {
    if (!editingBudget) return;

    try {
      const { error } = await supabase
        .from("budget_items")
        .update({
          category: budgetForm.category,
          description: budgetForm.description || null,
          allocated_amount: budgetForm.allocated_amount,
        })
        .eq("id", editingBudget.id);

      if (error) throw error;

      setBudgetItems(
        budgetItems.map((b) =>
          b.id === editingBudget.id
            ? {
                ...b,
                category: budgetForm.category,
                description: budgetForm.description || null,
                allocated_amount: budgetForm.allocated_amount,
              }
            : b
        )
      );
      setEditingBudget(null);
      resetBudgetForm();
      toast.success("Budget item updated");
    } catch (error) {
      console.error("Error updating budget item:", error);
      toast.error("Failed to update budget item");
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    try {
      const { error } = await supabase.from("budget_items").delete().eq("id", budgetId);

      if (error) throw error;

      setBudgetItems(budgetItems.filter((b) => b.id !== budgetId));
      toast.success("Budget item deleted");
    } catch (error) {
      console.error("Error deleting budget item:", error);
      toast.error("Failed to delete budget item");
    }
  };

  const resetOrderForm = () => {
    setOrderForm({
      product_name: "",
      quantity: 1,
      unit_price: 0,
      status: "pending",
      supplier: "",
      order_date: new Date().toISOString().split("T")[0],
      expected_delivery: "",
      notes: "",
      budget_category: "",
    });
    setProductInputMode("manual");
    setSelectedProductId("");
    setNewProductCategory("");
    setReceiptFile(null);
  };

  const resetBudgetForm = () => {
    setBudgetForm({
      category: "",
      description: "",
      allocated_amount: 0,
    });
  };

  const openEditOrder = (order: Order) => {
    setOrderForm({
      product_name: order.product_name,
      quantity: order.quantity,
      unit_price: order.unit_price,
      status: order.status,
      supplier: order.supplier || "",
      order_date: order.order_date,
      expected_delivery: order.expected_delivery || "",
      notes: order.notes || "",
      budget_category: order.budget_category || "",
    });
    setEditingOrder(order);
  };

  const openEditBudget = (budget: BudgetItem) => {
    setBudgetForm({
      category: budget.category,
      description: budget.description || "",
      allocated_amount: budget.allocated_amount,
    });
    setEditingBudget(budget);
  };

  // Calculate totals - spent amounts come from orders
  const totalOrderValue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "ordered").length;
  const totalBudget = budgetItems.reduce((sum, b) => sum + Number(b.allocated_amount), 0);
  
  // Calculate spent per category from orders
  const spentByCategory = orders.reduce((acc, order) => {
    const category = order.budget_category || "Uncategorized";
    acc[category] = (acc[category] || 0) + Number(order.total_price);
    return acc;
  }, {} as Record<string, number>);
  
  // Total spent is the sum of all order totals
  const totalSpent = totalOrderValue;
  const budgetRemaining = totalBudget - totalSpent;

  // Sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="w-4 h-4 ml-1" /> 
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortField) return 0;
    
    let aVal: string | number | null;
    let bVal: string | number | null;
    
    switch (sortField) {
      case "product_name":
        aVal = a.product_name.toLowerCase();
        bVal = b.product_name.toLowerCase();
        break;
      case "budget_category":
        aVal = (a.budget_category || "").toLowerCase();
        bVal = (b.budget_category || "").toLowerCase();
        break;
      case "status":
        aVal = a.status.toLowerCase();
        bVal = b.status.toLowerCase();
        break;
      case "supplier":
        aVal = (a.supplier || "").toLowerCase();
        bVal = (b.supplier || "").toLowerCase();
        break;
      case "order_date":
        aVal = a.order_date;
        bVal = b.order_date;
        break;
      default:
        return 0;
    }
    
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Chart data
  // Chart data - use spent from orders by category
  const budgetChartData = budgetItems.map((b) => ({
    name: b.category,
    allocated: Number(b.allocated_amount),
    spent: spentByCategory[b.category] || 0,
  }));

  const orderStatusData = ORDER_STATUSES.map((status) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: orders.filter((o) => o.status === status).length,
  })).filter((d) => d.value > 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600";
      case "ordered":
        return "bg-blue-500/10 text-blue-600";
      case "shipped":
        return "bg-purple-500/10 text-purple-600";
      case "delivered":
        return "bg-green-500/10 text-green-600";
      case "cancelled":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "ordered":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (!projectId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Please select a project to view orders and budget.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-xl font-semibold text-foreground">${totalBudget.toLocaleString()}</p>
              </div>
            </div>
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setActiveSubTab("budget");
                  setShowAddBudgetModal(true);
                }}
                className="h-8 w-8"
                title="Add budget item"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spent to Date</p>
                <p className="text-xl font-semibold text-foreground">${totalSpent.toLocaleString()}</p>
              </div>
            </div>
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveSubTab("budget")}
                className="h-8 w-8"
                title="View budget breakdown"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining Budget</p>
                <p className={`text-xl font-semibold ${budgetRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${budgetRemaining.toLocaleString()}
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveSubTab("budget")}
                className="h-8 w-8"
                title="View budget breakdown"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Orders and Budget */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          {isAdmin && activeSubTab === "orders" && (
            <Button onClick={() => setShowAddOrderModal(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Order
            </Button>
          )}
          {isAdmin && activeSubTab === "budget" && (
            <Button onClick={() => setShowAddBudgetModal(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Budget Item
            </Button>
          )}
        </div>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-0">
          <div className="bg-card rounded-lg shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("product_name")}
                  >
                    <div className="flex items-center">
                      Product
                      {getSortIcon("product_name")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("budget_category")}
                  >
                    <div className="flex items-center">
                      Category
                      {getSortIcon("budget_category")}
                    </div>
                  </TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("supplier")}
                  >
                    <div className="flex items-center">
                      Supplier
                      {getSortIcon("supplier")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("order_date")}
                  >
                    <div className="flex items-center">
                      Order Date
                      {getSortIcon("order_date")}
                    </div>
                  </TableHead>
                  <TableHead>Receipt</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingOrders ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 10 : 9} className="text-center py-8">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 10 : 9} className="text-center py-8 text-muted-foreground">
                      No orders yet
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.product_name}</TableCell>
                      <TableCell>
                        {order.budget_category ? (
                          <span className="px-2 py-1 bg-muted rounded text-xs">{order.budget_category}</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>${Number(order.unit_price).toFixed(2)}</TableCell>
                      <TableCell className="font-medium">${Number(order.total_price).toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{order.supplier || "-"}</TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {order.receipt_url ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setPreviewReceiptUrl(order.receipt_url)}
                              title="Preview receipt"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <a
                              href={order.receipt_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted"
                              title="Download receipt"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditOrder(order)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteOrder(order.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {orders.length > 0 && (
              <div className="border-t border-border p-4 bg-muted/30">
                <div className="flex justify-end">
                  <span className="font-medium text-foreground">
                    Total Order Value: <span className="text-gold">${totalOrderValue.toLocaleString()}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="mt-0">
          <div className="bg-card rounded-lg shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Allocated</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>% Used</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingBudget ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8">
                      Loading budget...
                    </TableCell>
                  </TableRow>
                ) : budgetItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">
                      No budget items yet
                    </TableCell>
                  </TableRow>
                ) : (
                  budgetItems.map((item) => {
                    const spent = spentByCategory[item.category] || 0;
                    const remaining = Number(item.allocated_amount) - spent;
                    const percentUsed = item.allocated_amount > 0 
                      ? Math.round((spent / Number(item.allocated_amount)) * 100)
                      : 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>{item.description || "-"}</TableCell>
                        <TableCell>${Number(item.allocated_amount).toLocaleString()}</TableCell>
                        <TableCell>${spent.toLocaleString()}</TableCell>
                        <TableCell className={remaining >= 0 ? "text-green-600" : "text-red-600"}>
                          ${remaining.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${percentUsed > 100 ? "bg-red-500" : percentUsed > 80 ? "bg-yellow-500" : "bg-green-500"}`}
                                style={{ width: `${Math.min(percentUsed, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{percentUsed}%</span>
                          </div>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditBudget(item)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(item.id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            {budgetItems.length > 0 && (
              <div className="border-t border-border p-4 bg-muted/30">
                <div className="flex justify-end">
                  <span className="font-medium text-foreground">
                    Total Budget: <span className="text-gold">${totalBudget.toLocaleString()}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Bar Chart */}
            <div className="bg-card rounded-lg p-6 shadow-soft">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Budget Overview</h3>
              {budgetItems.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                    <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Legend />
                    <Bar dataKey="allocated" name="Allocated" fill="hsl(var(--gold))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" name="Spent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No budget data to display
                </div>
              )}
            </div>

            {/* Order Status Pie Chart */}
            <div className="bg-card rounded-lg p-6 shadow-soft">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Order Status</h3>
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {orderStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={BUDGET_COLORS[index % BUDGET_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No order data to display
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Order Modal */}
      <Dialog 
        open={showAddOrderModal || !!editingOrder} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddOrderModal(false);
            setEditingOrder(null);
            resetOrderForm();
          }
        }}
      >
        <DialogContent 
          className="max-w-md max-h-[90vh] overflow-y-auto"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{editingOrder ? "Edit Order" : "Add Order"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Product Input Mode Selection - only show when adding, not editing */}
            {!editingOrder && (
              <div>
                <Label>Product Source</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={productInputMode === "manual" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setProductInputMode("manual");
                      setSelectedProductId("");
                      setOrderForm(prev => ({ ...prev, product_name: "", supplier: "" }));
                    }}
                  >
                    Manual Entry
                  </Button>
                  <Button
                    type="button"
                    variant={productInputMode === "inventory" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setProductInputMode("inventory");
                      setOrderForm(prev => ({ ...prev, product_name: "", supplier: "" }));
                    }}
                  >
                    From Inventory
                  </Button>
                </div>
                {productInputMode === "manual" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    New products will be automatically added to inventory
                  </p>
                )}
              </div>
            )}

            {/* Product Selection - Inventory Mode */}
            {productInputMode === "inventory" && !editingOrder && (
              <div>
                <Label>Select Product *</Label>
                <Select value={selectedProductId} onValueChange={handleProductSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose from inventory..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {inventoryProducts.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No products in inventory</div>
                    ) : (
                      inventoryProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} {product.category && `(${product.category})`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Product Name - Manual Mode */}
            {(productInputMode === "manual" || editingOrder) && (
              <div>
                <Label htmlFor="product_name">Product Name *</Label>
                <Input
                  id="product_name"
                  value={orderForm.product_name}
                  onChange={(e) => setOrderForm({ ...orderForm, product_name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="unit_price">Unit Price ($)</Label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={orderForm.unit_price}
                  onChange={(e) => setOrderForm({ ...orderForm, unit_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={orderForm.supplier}
                onChange={(e) => setOrderForm({ ...orderForm, supplier: e.target.value })}
                placeholder="Enter supplier name"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={orderForm.status} onValueChange={(val) => setOrderForm({ ...orderForm, status: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order_date">Order Date</Label>
                <Input
                  id="order_date"
                  type="date"
                  value={orderForm.order_date}
                  onChange={(e) => setOrderForm({ ...orderForm, order_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expected_delivery">Expected Delivery</Label>
                <Input
                  id="expected_delivery"
                  type="date"
                  value={orderForm.expected_delivery}
                  onChange={(e) => setOrderForm({ ...orderForm, expected_delivery: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="budget_category">Budget Category</Label>
              <Select 
                value={orderForm.budget_category || "none"} 
                onValueChange={(val) => setOrderForm({ ...orderForm, budget_category: val === "none" ? "" : val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {budgetItems.map((item) => (
                    <SelectItem key={item.id} value={item.category}>
                      {item.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Assign to a budget category to track spending
              </p>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={orderForm.notes}
                onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
            {isAdmin && (
              <div>
                <Label htmlFor="receipt">Receipt</Label>
                <div className="mt-1">
                  {receiptFile ? (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm flex-1 truncate">{receiptFile.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setReceiptFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : editingOrder?.receipt_url ? (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm flex-1 truncate">Current receipt attached</span>
                      <a
                        href={editingOrder.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline"
                      >
                        View
                      </a>
                    </div>
                  ) : null}
                  <label
                    htmlFor="receipt-upload"
                    className="mt-2 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {receiptFile || editingOrder?.receipt_url ? "Replace receipt" : "Upload receipt (PDF, image)"}
                    </span>
                  </label>
                  <input
                    id="receipt-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setReceiptFile(file);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddOrderModal(false);
              setEditingOrder(null);
              resetOrderForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingOrder ? handleUpdateOrder : handleAddOrder}
              disabled={isUploadingReceipt}
            >
              {isUploadingReceipt ? "Uploading..." : (editingOrder ? "Update" : "Add")} Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Preview Modal */}
      <Dialog open={!!previewReceiptUrl} onOpenChange={(open) => !open && setPreviewReceiptUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {previewReceiptUrl?.endsWith('.pdf') ? (
              <iframe
                src={previewReceiptUrl}
                className="w-full h-[70vh] border rounded-md"
                title="Receipt PDF"
              />
            ) : (
              <img
                src={previewReceiptUrl || ''}
                alt="Receipt"
                className="max-w-full max-h-[70vh] object-contain rounded-md"
              />
            )}
            <a
              href={previewReceiptUrl || ''}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Budget Modal */}
      <Dialog 
        open={showAddBudgetModal || !!editingBudget} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddBudgetModal(false);
            setEditingBudget(null);
            resetBudgetForm();
          }
        }}
      >
        <DialogContent className="max-w-md" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{editingBudget ? "Edit Budget Item" : "Add Budget Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={budgetForm.category}
                onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                placeholder="e.g., Furniture, Lighting, Decor"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={budgetForm.description}
                onChange={(e) => setBudgetForm({ ...budgetForm, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="allocated_amount">Allocated ($)</Label>
                <Input
                  id="allocated_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={budgetForm.allocated_amount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, allocated_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Note: Spent amount is automatically calculated from orders assigned to this category.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddBudgetModal(false);
              setEditingBudget(null);
              resetBudgetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={editingBudget ? handleUpdateBudget : handleAddBudget}>
              {editingBudget ? "Update" : "Add"} Budget Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

OrderBudgetTab.displayName = "OrderBudgetTab";
