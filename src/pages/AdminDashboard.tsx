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
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/NotificationBell";
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

interface Client {
  id: string;
  name: string;
  email: string;
  project: string;
  status: string;
  progress: number;
}


const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAdmin, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [clientsSubTab, setClientsSubTab] = useState<"active" | "completed">("active");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [chatSectionOpen, setChatSectionOpen] = useState(true);
  const [clientChats, setClientChats] = useState<{ clientId: string; clientName: string; lastMessage: string; lastMessageTime: string; unread: boolean }[]>([]);
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

  // Fetch clients from database
  useEffect(() => {
    const fetchClients = async () => {
      if (!user || !isAdmin) return;
      
      setIsLoadingClients(true);
      try {
        // Fetch all client profiles first
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .eq("role", "client");

        if (profilesError) throw profilesError;

        // Fetch all projects
        const { data: projects, error } = await supabase
          .from("projects")
          .select(`
            id,
            name,
            status,
            progress,
            client_id
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Create client entries for all client profiles
        const clientsData: Client[] = (profiles || []).map((profile) => {
          // Find project for this client (if any)
          const project = projects?.find((p) => p.client_id === profile.id);
          return {
            id: profile.id, // Use profile id as the client id
            name: profile.full_name || profile.email,
            email: profile.email,
            project: project?.name || "No project assigned",
            status: project?.status || "New",
            progress: project?.progress || 0,
          };
        });

        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Failed to load clients");
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, [user, isAdmin]);

  // Fetch client chats (latest message per client)
  useEffect(() => {
    const fetchClientChats = async () => {
      if (!user || !isAdmin || clients.length === 0) return;

      try {
        // Get all projects with their client ids
        const { data: projects, error: projectsError } = await supabase
          .from("projects")
          .select("id, client_id");

        if (projectsError) throw projectsError;

        // Get latest messages for each project
        const chatPromises = (projects || []).map(async (project) => {
          const { data: messages } = await supabase
            .from("messages")
            .select("text, created_at, sender_id")
            .eq("project_id", project.id)
            .order("created_at", { ascending: false })
            .limit(1);

          if (messages && messages.length > 0) {
            const client = clients.find((c) => c.id === project.client_id);
            if (client) {
              return {
                clientId: client.id,
                clientName: client.name,
                lastMessage: messages[0].text,
                lastMessageTime: messages[0].created_at,
                unread: messages[0].sender_id === client.id, // Unread if client sent last
              };
            }
          }
          return null;
        });

        const results = await Promise.all(chatPromises);
        const validChats = results
          .filter((c): c is NonNullable<typeof c> => c !== null)
          .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

        setClientChats(validChats);
      } catch (error) {
        console.error("Error fetching client chats:", error);
      }
    };

    fetchClientChats();
  }, [user, isAdmin, clients]);

  // Calculate stats from real data
  const activeClients = clients.filter(c => c.status !== "Completed");
  const completedClients = clients.filter(c => c.status === "Completed");
  
  const stats = [
    { label: "Current Clients", value: activeClients.length.toString(), change: "Active clients", onClick: () => { setActiveTab("clients"); setClientsSubTab("active"); } },
    { label: "Completed Projects", value: completedClients.length.toString(), change: "Finished projects", onClick: () => { setActiveTab("clients"); setClientsSubTab("completed"); } },
  ];

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

  const handleClientClick = (clientId: string) => {
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

      // Add a temporary client entry (will be updated when client registers)
      const tempClient: Client = {
        id: crypto.randomUUID(),
        name: newClient.name,
        email: newClient.email,
        project: newClient.project,
        status: newClient.status,
        progress: newClient.status === "Planning" ? 5 : 0,
      };
      
      setClients([tempClient, ...clients]);
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

  // Refetch clients function
  const refetchClients = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("role", "client");

      if (profilesError) throw profilesError;

      const { data: projects, error } = await supabase
        .from("projects")
        .select(`id, name, status, progress, client_id`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const clientsData: Client[] = (profiles || []).map((profile) => {
        const project = projects?.find((p) => p.client_id === profile.id);
        return {
          id: profile.id,
          name: profile.full_name || profile.email,
          email: profile.email,
          project: project?.name || "No project assigned",
          status: project?.status || "New",
          progress: project?.progress || 0,
        };
      });

      setClients(clientsData);
    } catch (error) {
      console.error("Error refetching clients:", error);
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

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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

            {/* Chat Section */}
            <div className="pt-4 mt-4 border-t border-primary-foreground/10">
              <button
                onClick={() => setChatSectionOpen(!chatSectionOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  <span>Messages</span>
                </div>
                {chatSectionOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {chatSectionOpen && (
                <div className="mt-2 space-y-1">
                  {clientChats.length === 0 ? (
                    <p className="px-4 py-2 text-xs text-primary-foreground/50">No conversations yet</p>
                  ) : (
                    clientChats.map((chat) => (
                      <button
                        key={chat.clientId}
                        onClick={() => {
                          navigate(`/admin/client/${chat.clientId}?tab=chat`);
                          setSidebarOpen(false);
                        }}
                        className="w-full flex items-start gap-3 px-4 py-2 rounded-lg text-left hover:bg-primary-foreground/10 transition-colors group"
                      >
                        <div className="relative">
                          <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-gold text-xs font-medium">
                              {chat.clientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          {chat.unread && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gold rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${chat.unread ? "font-semibold text-primary-foreground" : "font-medium text-primary-foreground/80"}`}>
                            {chat.clientName}
                          </p>
                          <p className="text-xs text-primary-foreground/50 truncate">
                            {chat.lastMessage.slice(0, 30)}{chat.lastMessage.length > 30 ? "..." : ""}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
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
            {user && <NotificationBell userId={user.id} />}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div 
                    key={stat.label} 
                    className="bg-card rounded-lg p-6 shadow-soft cursor-pointer hover:shadow-medium transition-all"
                    onClick={stat.onClick}
                  >
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

              {/* Sub-tabs for Active/Completed */}
              <div className="flex gap-2">
                <Button
                  variant={clientsSubTab === "active" ? "default" : "outline"}
                  onClick={() => setClientsSubTab("active")}
                  size="sm"
                >
                  Active ({activeClients.length})
                </Button>
                <Button
                  variant={clientsSubTab === "completed" ? "default" : "outline"}
                  onClick={() => setClientsSubTab("completed")}
                  size="sm"
                >
                  Completed ({completedClients.length})
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
                {isLoadingClients ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                  </div>
                ) : (() => {
                  const displayClients = (clientsSubTab === "active" ? activeClients : completedClients)
                    .filter(client => 
                      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      client.project.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                  
                  return displayClients.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery 
                          ? "No clients match your search" 
                          : clientsSubTab === "active" 
                            ? "No active clients yet." 
                            : "No completed projects yet."}
                      </p>
                    </div>
                  ) : (
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
                          {displayClients.map((client) => (
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
                  );
                })()}
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
