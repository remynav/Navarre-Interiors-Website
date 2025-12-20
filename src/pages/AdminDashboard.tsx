import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  LogOut,
  Menu,
  X,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductInventoryTab } from "@/components/admin/ProductInventoryTab";

// Mock data - using state now for dynamic updates
const initialClients = [
  { id: 1, name: "John Smith", email: "john@example.com", project: "Modern Penthouse Renovation", status: "In Progress", progress: 65 },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", project: "Coastal Beach House", status: "In Progress", progress: 40 },
  { id: 3, name: "Michael Chen", email: "michael@example.com", project: "Minimalist Loft", status: "Completed", progress: 100 },
  { id: 4, name: "Emily Davis", email: "emily@example.com", project: "Urban Studio Apartment", status: "Planning", progress: 15 },
  { id: 5, name: "Robert Wilson", email: "robert@example.com", project: "Classic Colonial Refresh", status: "On Hold", progress: 30 },
];

const stats = [
  { label: "Total Clients", value: "24", change: "+3 this month" },
  { label: "Active Projects", value: "18", change: "5 completing soon" },
  { label: "Completed", value: "47", change: "+8 this year" },
  { label: "Revenue", value: "$284K", change: "+12% vs last month" },
];


const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAdmin, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState(initialClients);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    project: "",
    status: "Planning",
  });
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);

  // Check if logged in and is admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/admin-login");
      } else if (!isAdmin) {
        toast.error("You don't have admin access");
        navigate("/client");
      }
    }
  }, [user, authLoading, isAdmin, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "clients", label: "Clients", icon: Users },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "inventory", label: "Product Inventory", icon: Package },
  ];

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-gold/10 text-gold";
      case "Completed":
        return "bg-green-500/10 text-green-600";
      case "Planning":
        return "bg-blue-500/10 text-blue-600";
      case "On Hold":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleClientClick = (clientId: number) => {
    navigate(`/admin/client/${clientId}`);
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email || !newClient.project) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSendingInvitation(true);
    
    try {
      // Send invitation email
      const { data, error } = await supabase.functions.invoke('send-client-invitation', {
        body: {
          clientName: newClient.name,
          clientEmail: newClient.email,
          projectName: newClient.project,
          portalUrl: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        console.error("Error sending invitation:", error);
        toast.error("Failed to send invitation email");
        setIsSendingInvitation(false);
        return;
      }

      const client = {
        id: clients.length + 1,
        name: newClient.name,
        email: newClient.email,
        project: newClient.project,
        status: newClient.status,
        progress: newClient.status === "Planning" ? 5 : 0,
      };
      
      setClients([...clients, client]);
      setNewClient({ name: "", email: "", project: "", status: "Planning" });
      setShowAddClientModal(false);
      toast.success("Client added and invitation email sent!");
    } catch (err) {
      console.error("Error adding client:", err);
      toast.error("Failed to add client");
    } finally {
      setIsSendingInvitation(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-primary-foreground/10">
            <Link to="/" className="font-display text-xl font-semibold text-primary-foreground tracking-tight">
              Navarre<span className="text-gold"> Interiors</span>
            </Link>
            <p className="text-sm text-primary-foreground/60 mt-1">Admin Portal</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-gold text-primary"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-primary-foreground/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <button
            className="lg:hidden p-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@navarre.com</p>
            </div>
            <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
              <span className="text-primary font-medium">A</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Overview of your business
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-card rounded-lg p-6 shadow-soft">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="font-display text-3xl font-semibold text-foreground mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gold mt-2">{stat.change}</p>
                  </div>
                ))}
              </div>

              {/* Recent Clients */}
              <div className="bg-card rounded-lg shadow-soft">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Recent Clients
                  </h2>
                  <Button variant="gold" size="sm" onClick={() => setActiveTab("clients")}>
                    View All
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Project</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.slice(0, 5).map((client) => (
                        <tr 
                          key={client.id} 
                          className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => handleClientClick(client.id)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                                <span className="text-gold text-sm font-medium">
                                  {client.name.split(" ").map(n => n[0]).join("")}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{client.name}</p>
                                <p className="text-sm text-muted-foreground">{client.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-foreground">{client.project}</td>
                          <td className="p-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                              {client.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gold rounded-full"
                                  style={{ width: `${client.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">{client.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "clients" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-semibold text-foreground">
                    Clients
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your client base
                  </p>
                </div>
                <Button variant="gold" onClick={() => setShowAddClientModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clients..."
                  className="pl-10"
                />
              </div>

              {/* Clients Table */}
              <div className="bg-card rounded-lg shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Project</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Progress</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client) => (
                        <tr 
                          key={client.id} 
                          className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => handleClientClick(client.id)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                                <span className="text-gold text-sm font-medium">
                                  {client.name.split(" ").map(n => n[0]).join("")}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{client.name}</p>
                                <p className="text-sm text-muted-foreground">{client.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-foreground">{client.project}</td>
                          <td className="p-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                              {client.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gold rounded-full"
                                  style={{ width: `${client.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">{client.progress}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleClientClick(client.id)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Client
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
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
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-semibold text-foreground">
                    Projects
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage all your design projects
                  </p>
                </div>
                <Button variant="gold">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                  <div 
                    key={client.id} 
                    className="bg-card rounded-lg p-6 shadow-soft hover:shadow-medium transition-all cursor-pointer"
                    onClick={() => handleClientClick(client.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleClientClick(client.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Project
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {client.project}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Client: {client.name}
                    </p>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{client.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold rounded-full transition-all duration-500"
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "inventory" && <ProductInventoryTab />}

          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage admin settings
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-soft">
                <p className="text-muted-foreground">Admin settings coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Add Client Modal */}
      <Dialog open={showAddClientModal} onOpenChange={setShowAddClientModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Add New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Full Name *</Label>
              <Input
                id="client-name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                placeholder="Enter client name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email *</Label>
              <Input
                id="client-email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                placeholder="Enter client email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-project">Project Name *</Label>
              <Input
                id="client-project"
                value={newClient.project}
                onChange={(e) => setNewClient({ ...newClient, project: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-status">Status</Label>
              <Select
                value={newClient.status}
                onValueChange={(value) => setNewClient({ ...newClient, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClientModal(false)} disabled={isSendingInvitation}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleAddClient} disabled={isSendingInvitation}>
              {isSendingInvitation ? "Sending Invitation..." : "Add Client & Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
