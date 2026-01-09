import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  FileText,
  Calendar,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Image,
  Palette,
  ThumbsUp,
  Send,
  ChevronLeft,
  ChevronRight,
  PauseCircle,
  Download,
  Archive,
  Eye,
  Package,
  User,
  Save,
  Receipt,
  ChevronDown,
  ExternalLink,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useSharedInspirations, useSharedRenderings, useSharedDocuments } from "@/hooks/useSharedDesignState";
import { ClientProductsTab } from "@/components/client/ClientProductsTab";
import { InspirationBoardsTab } from "@/components/client/InspirationBoardsTab";
import { OrderBudgetTab } from "@/components/OrderBudgetTab";
import { OrderBudgetSummary } from "@/components/OrderBudgetSummary";
import { DocumentPreviewModal } from "@/components/DocumentPreviewModal";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/NotificationBell";
import { notifyAdmins, markNotificationsAsRead } from "@/hooks/useNotifications";

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
}

interface ProjectData {
  id: string;
  name: string;
  status: string;
  start_date: string | null;
  estimated_completion: string | null;
  designer: string | null;
  progress: number;
}

const milestones = [
  { id: 1, title: "Concept Development", status: "completed", date: "Oct 20" },
  { id: 2, title: "Design Approval", status: "completed", date: "Nov 5" },
  { id: 3, title: "Material Selection", status: "completed", date: "Nov 20" },
  { id: 4, title: "Furniture Procurement", status: "in-progress", date: "Dec 15" },
  { id: 5, title: "Installation Phase 1", status: "upcoming", date: "Jan 10" },
  { id: 6, title: "Final Styling", status: "upcoming", date: "Feb 15" },
];

const chatMessages = [
  { id: 1, sender: "designer", name: "Sarah Mitchell", text: "Hi! The furniture samples have arrived. When can you come to the showroom?", time: "10:30 AM" },
  { id: 2, sender: "client", text: "That's great news! I can come by tomorrow afternoon, around 2pm?", time: "10:45 AM" },
  { id: 3, sender: "designer", name: "Sarah Mitchell", text: "Perfect! I'll have everything set up for you. Looking forward to seeing you!", time: "10:48 AM" },
];

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [inspirations, setInspirations] = useSharedInspirations();
  const [renderings, setRenderings] = useSharedRenderings();
  const [documents] = useSharedDocuments();
  const [docTab, setDocTab] = useState<"sent" | "archive">("sent");
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showDocPreviewModal, setShowDocPreviewModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  
  // Reference for messages (for "Ask a Question" feature)
  const [pendingReference, setPendingReference] = useState<{
    type: string;
    id: string;
    title: string;
    image: string;
  } | null>(null);

  // Profile and project state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editProfile, setEditProfile] = useState({
    full_name: "",
    phone_number: "",
    address: "",
  });

  // Check if logged in and fetch profile
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchProfileAndProjects();
    }
  }, [user, authLoading, navigate]);

  // Mark notifications as read when switching tabs
  useEffect(() => {
    if (!user) return;
    
    const typeMap: Record<string, string> = {
      messages: 'message',
      renderings: 'rendering',
      documents: 'document',
      inspiration: 'inspiration',
      timeline: 'milestone',
    };
    
    const notificationType = typeMap[activeTab];
    if (notificationType) {
      markNotificationsAsRead(user.id, notificationType);
    }
  }, [activeTab, user]);

  const fetchProfileAndProjects = async () => {
    if (!user) return;
    
    setIsLoadingProfile(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone_number, address")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData as ProfileData);
        setEditProfile({
          full_name: profileData.full_name || "",
          phone_number: profileData.phone_number || "",
          address: profileData.address || "",
        });
      }

      // Fetch projects for this client
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id, name, status, start_date, estimated_completion, designer, progress")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      setProjects(projectsData || []);
      if (projectsData && projectsData.length > 0) {
        setSelectedProjectId(projectsData[0].id);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editProfile.full_name,
          phone_number: editProfile.phone_number,
          address: editProfile.address,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        full_name: editProfile.full_name,
        phone_number: editProfile.phone_number,
        address: editProfile.address,
      } : null);
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getSelectedProject = () => projects.find(p => p.id === selectedProjectId);

  // Fetch messages and set up realtime subscription
  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("project_id", selectedProjectId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setAllMessages(data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`client-messages-${selectedProjectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `project_id=eq.${selectedProjectId}`,
        },
        (payload) => {
          setAllMessages((prev) => [...prev, payload.new as any]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedProjectId]);

  // Document handlers
  const clientDocuments = documents.filter(d => d.status === "sent" || d.status === "archived");
  const filteredClientDocs = clientDocuments.filter(d => docTab === "sent" ? d.status === "sent" : d.status === "archived");
  const getSelectedDocument = () => documents.find(d => d.id === selectedDocId);

  const handlePreviewDocument = (docId: number) => {
    setSelectedDocId(docId);
    setShowDocPreviewModal(true);
  };

  const handleDownloadDocument = (doc: any) => {
    if (doc.data) {
      const link = document.createElement('a');
      link.href = doc.data;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error("Download not available for this document");
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSendMessage = async (customText?: string) => {
    const messageText = customText || newMessage;
    if (!messageText.trim() || !selectedProjectId || !user) return;

    try {
      const messageData: any = {
        project_id: selectedProjectId,
        sender_id: user.id,
        text: messageText.trim(),
      };
      
      // Include reference if present
      if (pendingReference) {
        messageData.reference_type = pendingReference.type;
        messageData.reference_id = pendingReference.id;
        messageData.reference_title = pendingReference.title;
        messageData.reference_image_url = pendingReference.image;
      }

      const { error } = await supabase.from("messages").insert(messageData);

      if (error) throw error;
      
      // Notify admins about new message
      notifyAdmins(
        'message',
        `New message from ${profile?.full_name || 'Client'}`,
        messageText.slice(0, 100) + (messageText.length > 100 ? '...' : ''),
        selectedProjectId,
        'project'
      );
      
      setNewMessage("");
      setPendingReference(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // Handle "Ask a Question" from renderings or design items
  const handleAskQuestion = (item: { type: string; id: number; title: string; image: string }) => {
    setPendingReference({
      type: item.type,
      id: item.id.toString(),
      title: item.title,
      image: item.image,
    });
    setActiveTab("messages");
    toast.info(`Asking about: ${item.title}`);
  };

  const handleApproveRendering = (renderingId: number) => {
    const rendering = renderings.find(r => r.id === renderingId);
    setRenderings(renderings.map(r => 
      r.id === renderingId 
        ? { ...r, status: "approved" } 
        : r
    ));
    
    // Notify admins about rendering approval
    if (rendering) {
      notifyAdmins(
        'rendering',
        `Rendering approved by ${profile?.full_name || 'Client'}`,
        `"${rendering.title}" has been approved`,
        selectedProjectId || undefined,
        'project'
      );
    }
    
    toast.success("Rendering approved!");
  };

  const handleUndoApproval = (renderingId: number) => {
    setRenderings(renderings.map(r => 
      r.id === renderingId 
        ? { ...r, status: "pending" } 
        : r
    ));
    toast.success("Approval undone - rendering is pending again");
  };

  const handleAskAboutRendering = (rendering: any) => {
    handleAskQuestion({
      type: 'rendering',
      id: rendering.id,
      title: rendering.title,
      image: rendering.image,
    });
  };

  const getSelectedBoard = () => inspirations.find(b => b.id === selectedBoardId);

  const handleOpenGallery = (boardId: number) => {
    setSelectedBoardId(boardId);
    setGalleryIndex(0);
    setShowGalleryModal(true);
  };

  const handleNextImage = () => {
    const board = getSelectedBoard();
    if (board && galleryIndex < board.gallery.length - 1) {
      setGalleryIndex(galleryIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (galleryIndex > 0) {
      setGalleryIndex(galleryIndex - 1);
    }
  };

  const handleApproveItem = (boardId: number, itemId: number) => {
    const board = inspirations.find(b => b.id === boardId);
    const item = board?.designItems.find(i => i.id === itemId);
    
    setInspirations(inspirations.map(board => 
      board.id === boardId 
        ? {
            ...board,
            designItems: board.designItems.map(item =>
              item.id === itemId
                ? { ...item, status: "approved" }
                : item
            )
          }
        : board
    ));
    
    // Notify admins about item approval
    if (item) {
      notifyAdmins(
        'inspiration',
        `Design item approved by ${profile?.full_name || 'Client'}`,
        `"${item.name}" has been approved`,
        selectedProjectId || undefined,
        'project'
      );
    }
    
    toast.success("Item approved!");
  };

  const handleUndoItemApproval = (boardId: number, itemId: number) => {
    setInspirations(inspirations.map(board => 
      board.id === boardId 
        ? {
            ...board,
            designItems: board.designItems.map(item =>
              item.id === itemId
                ? { ...item, status: "pending" }
                : item
            )
          }
        : board
    ));
    toast.success("Approval undone");
  };

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500/10 text-green-600";
      case "pending": return "bg-gold/10 text-gold";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "profile", label: "Profile", icon: User },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders & Budget", icon: Receipt },
    { id: "inspiration", label: "Inspiration", icon: Palette },
    { id: "renderings", label: "Renderings", icon: Image },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500/10 text-green-600";
      case "pending": return "bg-gold/10 text-gold";
      case "revision": return "bg-orange-500/10 text-orange-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const selectedProject = getSelectedProject();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <Link to="/" className="font-display text-xl font-semibold text-foreground tracking-tight">
              Navarre<span className="text-gold"> Interiors</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">Client Portal</p>
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
                    ? "bg-gold/10 text-gold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.id === "messages" && (
                  <span className="ml-auto bg-gold text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    2
                  </span>
                )}
                {item.id === "renderings" && (
                  <span className="ml-auto bg-orange-500 text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    1
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X /> : <Menu />}
            </button>
            
            {/* Project Selector - only show if multiple projects */}
            {projects.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    <span className="max-w-[200px] truncate">{selectedProject?.name || "Select Project"}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[250px]">
                  {projects.map((project) => (
                    <DropdownMenuItem
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      className={selectedProjectId === project.id ? "bg-muted" : ""}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-xs text-muted-foreground">{project.status}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user && <NotificationBell userId={user.id} />}
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {profile?.full_name || profile?.email?.split('@')[0] || "User"}
              </p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
              <span className="text-gold font-medium">
                {(profile?.full_name || profile?.email || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Back Button for inner tabs */}
          {activeTab !== "overview" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("overview")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          )}

          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  Welcome back, {profile?.full_name?.split(" ")[0] || "there"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {getSelectedProject()?.name || "Your client portal"}
                </p>
              </div>

              {/* Module Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {navItems.filter(item => item.id !== "overview").map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="bg-card p-6 rounded-lg shadow-soft hover:shadow-medium transition-all text-left group relative"
                  >
                    <item.icon className="w-8 h-8 text-gold mb-3" />
                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-gold transition-colors">
                      {item.label}
                    </h3>
                    {item.id === "messages" && (
                      <span className="absolute top-4 right-4 w-3 h-3 bg-gold rounded-full" />
                    )}
                    {item.id === "renderings" && renderings.filter(r => r.status === "pending").length > 0 && (
                      <span className="absolute top-4 right-4 w-3 h-3 bg-orange-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  Profile Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                  Update your personal information
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-soft max-w-2xl">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={editProfile.full_name}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={editProfile.phone_number}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={editProfile.address}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter your address"
                      rows={3}
                    />
                  </div>

                  <Button 
                    variant="gold" 
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="w-full sm:w-auto"
                  >
                    {isSavingProfile ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  Documents
                </h1>
                <p className="text-muted-foreground mt-1">
                  All your project files and documents
                </p>
              </div>

              {/* Document Tabs */}
              <div className="flex gap-2 border-b border-border">
                <button
                  onClick={() => setDocTab("sent")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    docTab === "sent" ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Documents ({clientDocuments.filter(d => d.status === "sent").length})
                </button>
                <button
                  onClick={() => setDocTab("archive")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    docTab === "archive" ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Archive className="w-4 h-4 inline mr-1" />
                  Archive ({clientDocuments.filter(d => d.status === "archived").length})
                </button>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-soft">
                {filteredClientDocs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {docTab === "sent" ? "No documents available yet" : "No archived documents"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredClientDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => handlePreviewDocument(doc.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gold" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">{doc.type} • {doc.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.status === "archived" && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Archived</span>
                          )}
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDownloadDocument(doc); }}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "products" && <ClientProductsTab />}

          {activeTab === "orders" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  Orders & Budget
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track orders and project budget
                </p>
              </div>
              <OrderBudgetTab projectId={selectedProjectId} isAdmin={false} />
            </div>
          )}

          {activeTab === "inspiration" && (
            <InspirationBoardsTab
              inspirations={inspirations}
              setInspirations={setInspirations}
              onAskQuestion={handleAskQuestion}
            />
          )}

          {activeTab === "renderings" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  Renderings for Approval
                </h1>
                <p className="text-muted-foreground mt-1">
                  Review and approve design renderings
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderings.filter(r => r.sent).map((rendering) => (
                  <div key={rendering.id} className="bg-card rounded-lg overflow-hidden shadow-soft">
                    <div className="aspect-video relative">
                      <img
                        src={rendering.image}
                        alt={rendering.title}
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rendering.status)}`}>
                        {rendering.status === "approved" ? "Approved" : "Pending Approval"}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          {rendering.title}
                        </h3>
                      </div>
                      {rendering.status === "approved" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">You approved this rendering</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleUndoApproval(rendering.id)}
                          >
                            Undo Approval
                          </Button>
                        </div>
                      )}
                      {rendering.status !== "approved" && (
                        <Button 
                          variant="gold" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleApproveRendering(rendering.id)}
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      )}
                      {/* Ask a Question Button */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => handleAskAboutRendering(rendering)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask a Question
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {activeTab === "messages" && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              <div className="mb-6">
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  Messages
                </h1>
                <p className="text-muted-foreground mt-1">
                  Chat with your design team
                </p>
              </div>
              <div className="bg-card rounded-lg shadow-soft overflow-hidden">
                {/* Messages */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                    </div>
                  ) : !selectedProjectId ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No project selected.
                    </div>
                  ) : allMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No messages yet. Start the conversation with your design team!
                    </div>
                  ) : (
                    allMessages.map((msg) => {
                      const isClient = msg.sender_id === user?.id;
                      const hasReference = msg.reference_type && msg.reference_title;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isClient ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[70%] ${isClient ? "" : "flex gap-3"}`}>
                            {!isClient && (
                              <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-gold text-xs font-medium">NI</span>
                              </div>
                            )}
                            <div>
                              {!isClient && (
                                <p className="text-xs text-muted-foreground mb-1">Navarre Interiors</p>
                              )}
                              {/* Reference Card - Clickable */}
                              {hasReference && (
                                <button
                                  onClick={() => {
                                    if (msg.reference_type === 'rendering') {
                                      setActiveTab('renderings');
                                    } else if (msg.reference_type === 'design_item') {
                                      setActiveTab('inspiration');
                                    }
                                  }}
                                  className={`mb-2 rounded-lg border ${isClient ? "border-primary-foreground/20" : "border-border"} overflow-hidden w-full text-left hover:bg-muted/80 transition-colors cursor-pointer`}
                                >
                                  <div className="flex items-center gap-2 p-2 bg-muted/50">
                                    {msg.reference_image_url && (
                                      <img 
                                        src={msg.reference_image_url} 
                                        alt={msg.reference_title} 
                                        className="w-10 h-10 rounded object-cover"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-muted-foreground capitalize">
                                        Re: {msg.reference_type?.replace('_', ' ')}
                                      </p>
                                      <p className="text-sm font-medium text-foreground truncate">
                                        {msg.reference_title}
                                      </p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  </div>
                                </button>
                              )}
                              <div
                                className={`rounded-lg p-3 ${
                                  isClient
                                    ? "bg-gold text-primary-foreground"
                                    : "bg-muted text-foreground"
                                }`}
                              >
                                <p className="text-sm">{msg.text}</p>
                              </div>
                              <p className={`text-xs mt-1 ${
                                isClient ? "text-right" : ""
                              } text-muted-foreground`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {/* Input */}
                <div className="border-t border-border p-4">
                  {/* Pending Reference Card */}
                  {pendingReference && (
                    <div className="mb-3 rounded-lg border border-gold/30 bg-gold/5 overflow-hidden">
                      <div className="flex items-center gap-2 p-2">
                        {pendingReference.image && (
                          <img 
                            src={pendingReference.image} 
                            alt={pendingReference.title} 
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground capitalize">
                            Asking about: {pendingReference.type.replace('_', ' ')}
                          </p>
                          <p className="text-sm font-medium text-foreground truncate">
                            {pendingReference.title}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setPendingReference(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={pendingReference ? "Type your question..." : "Type a message..."}
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button variant="gold" onClick={() => handleSendMessage()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your account preferences
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-soft">
                <p className="text-muted-foreground">Account settings coming soon...</p>
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

      {/* Gallery Modal */}
      <Dialog open={showGalleryModal} onOpenChange={setShowGalleryModal}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{getSelectedBoard()?.title} - Gallery</DialogTitle>
          </DialogHeader>
          <div className="relative">
            {getSelectedBoard() && (
              <>
                <img
                  src={getSelectedBoard()?.gallery[galleryIndex]}
                  alt={`Gallery image ${galleryIndex + 1}`}
                  className="w-full h-[400px] object-cover rounded-lg"
                />
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Button variant="ghost" size="icon" onClick={handlePrevImage} disabled={galleryIndex === 0} className="bg-background/80 hover:bg-background ml-2">
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button variant="ghost" size="icon" onClick={handleNextImage} disabled={galleryIndex === (getSelectedBoard()?.gallery.length || 1) - 1} className="bg-background/80 hover:bg-background mr-2">
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
                  {galleryIndex + 1} / {getSelectedBoard()?.gallery.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        open={showDocPreviewModal}
        onOpenChange={setShowDocPreviewModal}
        document={getSelectedDocument()}
        onDownload={handleDownloadDocument}
      />
    </div>
  );
};

export default ClientDashboard;
