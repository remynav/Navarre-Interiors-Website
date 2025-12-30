import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Order {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  supplier: string | null;
  order_date: string;
  expected_delivery: string | null;
}

interface BudgetItem {
  id: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
}

interface OrderBudgetSummaryProps {
  projectId: string | null;
  onViewAll?: () => void;
}

export const OrderBudgetSummary = ({ projectId, onViewAll }: OrderBudgetSummaryProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [ordersRes, budgetRes] = await Promise.all([
          supabase
            .from("orders")
            .select("id, product_name, quantity, unit_price, total_price, status, supplier, order_date, expected_delivery")
            .eq("project_id", projectId)
            .order("order_date", { ascending: false })
            .limit(5),
          supabase
            .from("budget_items")
            .select("id, category, allocated_amount, spent_amount")
            .eq("project_id", projectId)
            .order("category"),
        ]);

        if (ordersRes.data) setOrders(ordersRes.data);
        if (budgetRes.data) setBudgetItems(budgetRes.data);
      } catch (error) {
        console.error("Error fetching order/budget data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const totalBudget = budgetItems.reduce((sum, b) => sum + Number(b.allocated_amount), 0);
  const totalSpent = budgetItems.reduce((sum, b) => sum + Number(b.spent_amount), 0);
  const budgetRemaining = totalBudget - totalSpent;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "ordered").length;

  const budgetChartData = budgetItems.slice(0, 5).map((b) => ({
    name: b.category.length > 10 ? b.category.slice(0, 10) + "..." : b.category,
    allocated: Number(b.allocated_amount),
    spent: Number(b.spent_amount),
  }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "ordered":
        return <Package className="w-3 h-3" />;
      case "shipped":
        return <Truck className="w-3 h-3" />;
      case "delivered":
        return <CheckCircle className="w-3 h-3" />;
      case "cancelled":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

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

  if (!projectId) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold/10 rounded-lg">
              <Package className="w-4 h-4 text-gold" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Orders</p>
              <p className="text-lg font-semibold text-foreground">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold text-foreground">{pendingOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-lg font-semibold text-foreground">${totalBudget.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${budgetRemaining >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
              <DollarSign className={`w-4 h-4 ${budgetRemaining >= 0 ? "text-green-600" : "text-red-600"}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className={`text-lg font-semibold ${budgetRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${budgetRemaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-card rounded-lg p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Recent Orders</h3>
            {onViewAll && (
              <Button variant="ghost" size="sm" onClick={onViewAll}>
                View All
              </Button>
            )}
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Product</TableHead>
                    <TableHead className="text-xs">Total</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-sm font-medium py-2">{order.product_name}</TableCell>
                      <TableCell className="text-sm py-2">${Number(order.total_price).toFixed(0)}</TableCell>
                      <TableCell className="py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Budget Chart */}
        <div className="bg-card rounded-lg p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Budget Overview</h3>
            {onViewAll && (
              <Button variant="ghost" size="sm" onClick={onViewAll}>
                View All
              </Button>
            )}
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : budgetItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No budget items yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={budgetChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="allocated" name="Allocated" fill="hsl(var(--gold))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Spent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
