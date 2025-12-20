import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { toast } from "sonner";
import { useSharedInspirations, useSharedRenderings, useSharedDocuments } from "@/hooks/useSharedDesignState";

// Mock data for demo
const projectData = {
  name: "Modern Penthouse Renovation",
  status: "In Progress",
  startDate: "October 15, 2024",
  estimatedCompletion: "March 2025",
  designer: "Sarah Mitchell",
};

const milestones = [
  { id: 1, title: "Concept Development", status: "completed", date: "Oct 20" },
  { id: 2, title: "Design Approval", status: "completed", date: "Nov 5" },
  { id: 3, title: "Material Selection", status: "completed", date: "Nov 20" },
  { id: 4, title: "Furniture Procurement", status: "in-progress", date: "Dec 15" },
  { id: 5, title: "Installation Phase 1", status: "upcoming", date: "Jan 10" },
  { id: 6, title: "Final Styling", status: "upcoming", date: "Feb 15" },
];

const messages = [
  { id: 1, from: "Sarah Mitchell", message: "The furniture samples have arrived! When can you come to the showroom?", date: "2 hours ago", unread: true },
  { id: 2, from: "Project Team", message: "Weekly update: Phase 3 completed ahead of schedule.", date: "Yesterday", unread: false },
];

const chatMessages = [
  { id: 1, sender: "designer", name: "Sarah Mitchell", text: "Hi John! The furniture samples have arrived. When can you come to the showroom?", time: "10:30 AM" },
  { id: 2, sender: "client", text: "That's great news! I can come by tomorrow afternoon, around 2pm?", time: "10:45 AM" },
  { id: 3, sender: "designer", name: "Sarah Mitchell", text: "Perfect! I'll have everything set up for you. Looking forward to seeing you!", time: "10:48 AM" },
];

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [allMessages, setAllMessages] = useState(chatMessages);
  const [inspirations, setInspirations] = useSharedInspirations();
  const [renderings, setRenderings] = useSharedRenderings();
  const [documents] = useSharedDocuments();
  const [docTab, setDocTab] = useState<"sent" | "archive">("sent");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showItemCommentsModal, setShowItemCommentsModal] = useState(false);
  const [showDocPreviewModal, setShowDocPreviewModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newItemComment, setNewItemComment] = useState("");
  const [selectedRenderingId, setSelectedRenderingId] = useState<number | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Check if logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("clientLoggedIn");
    if (isLoggedIn !== "true") {
      navigate("/login");
    }
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.removeItem("clientLoggedIn");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setAllMessages([...allMessages, {
      id: allMessages.length + 1,
      sender: "client",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setNewMessage("");
    toast.success("Message sent");
  };

  const handleApproveRendering = (renderingId: number) => {
    setRenderings(renderings.map(r => 
      r.id === renderingId 
        ? { ...r, status: "approved" } 
        : r
    ));
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

  const handleViewComments = (renderingId: number) => {
    setSelectedRenderingId(renderingId);
    setNewComment("");
    setShowCommentsModal(true);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setRenderings(renderings.map(r => 
      r.id === selectedRenderingId 
        ? { 
            ...r, 
            commentsList: [...r.commentsList, {
              id: r.commentsList.length + 1,
              sender: "client",
              text: newComment,
              time: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            }]
          } 
        : r
    ));
    setNewComment("");
    toast.success("Comment added");
  };

  const getSelectedRendering = () => renderings.find(r => r.id === selectedRenderingId);
  const getSelectedBoard = () => inspirations.find(b => b.id === selectedBoardId);
  const getSelectedItem = () => {
    const board = inspirations.find(b => b.id === selectedBoardId);
    return board?.designItems.find(item => item.id === selectedItemId);
  };

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

  const handleViewItemComments = (boardId: number, itemId: number) => {
    setSelectedBoardId(boardId);
    setSelectedItemId(itemId);
    setNewItemComment("");
    setShowItemCommentsModal(true);
  };

  const handleAddItemComment = () => {
    if (!newItemComment.trim()) return;
    setInspirations(inspirations.map(board => 
      board.id === selectedBoardId 
        ? {
            ...board,
            designItems: board.designItems.map(item =>
              item.id === selectedItemId
                ? {
                    ...item,
                    commentsList: [...item.commentsList, {
                      id: item.commentsList.length + 1,
                      sender: "client",
                      text: newItemComment,
                      time: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    }]
                  }
                : item
            )
          }
        : board
    ));
    setNewItemComment("");
    toast.success("Comment added");
  };

  const handleApproveItem = (boardId: number, itemId: number) => {
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
    { id: "documents", label: "Documents", icon: FileText },
    { id: "inspiration", label: "Inspiration", icon: Palette },
    { id: "renderings", label: "Renderings", icon: Image },
    { id: "timeline", label: "Timeline", icon: Calendar },
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
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between lg:justify-end">
          <button
            className="lg:hidden p-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">John Smith</p>
              <p className="text-xs text-muted-foreground">john@example.com</p>
            </div>
            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
              <span className="text-gold font-medium">JS</span>
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
                  Welcome back, John
                </h1>
                <p className="text-muted-foreground mt-1">
                  Here's an overview of your project
                </p>
              </div>

              {/* Project Card */}
              <div className="bg-card rounded-lg p-6 shadow-soft">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gold font-medium uppercase tracking-wide">
                      Current Project
                    </p>
                    <h2 className="font-display text-2xl font-semibold text-foreground">
                      {projectData.name}
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    {projectData.status}
                  </span>
                </div>


                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium text-foreground">{projectData.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Completion</p>
                    <p className="font-medium text-foreground">{projectData.estimatedCompletion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lead Designer</p>
                    <p className="font-medium text-foreground">{projectData.designer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Milestone</p>
                    <p className="font-medium text-gold">Furniture Delivery</p>
                  </div>
                </div>
              </div>

              {/* Quick Access Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab("documents")}
                  className="bg-card p-6 rounded-lg shadow-soft hover:shadow-medium transition-all text-left group"
                >
                  <FileText className="w-8 h-8 text-gold mb-3" />
                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-gold transition-colors">Documents</h3>
                  <p className="text-sm text-muted-foreground">{documents.length} files</p>
                </button>
                <button
                  onClick={() => setActiveTab("inspiration")}
                  className="bg-card p-6 rounded-lg shadow-soft hover:shadow-medium transition-all text-left group"
                >
                  <Palette className="w-8 h-8 text-gold mb-3" />
                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-gold transition-colors">Inspiration</h3>
                  <p className="text-sm text-muted-foreground">{inspirations.length} boards</p>
                </button>
                <button
                  onClick={() => setActiveTab("renderings")}
                  className="bg-card p-6 rounded-lg shadow-soft hover:shadow-medium transition-all text-left group relative"
                >
                  <Image className="w-8 h-8 text-gold mb-3" />
                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-gold transition-colors">Renderings</h3>
                  <p className="text-sm text-muted-foreground">{renderings.filter(r => r.status === "pending").length} pending approval</p>
                  {renderings.filter(r => r.status === "pending").length > 0 && (
                    <span className="absolute top-4 right-4 w-3 h-3 bg-orange-500 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("messages")}
                  className="bg-card p-6 rounded-lg shadow-soft hover:shadow-medium transition-all text-left group relative"
                >
                  <MessageSquare className="w-8 h-8 text-gold mb-3" />
                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-gold transition-colors">Messages</h3>
                  <p className="text-sm text-muted-foreground">Chat with your team</p>
                  <span className="absolute top-4 right-4 w-3 h-3 bg-gold rounded-full" />
                </button>
              </div>

              {/* Recent Updates */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Documents */}
                <div className="bg-card rounded-lg p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Recent Documents
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("documents")}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {documents.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gold" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.type} • {doc.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Messages */}
                <div className="bg-card rounded-lg p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Recent Messages
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("messages")}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg transition-colors cursor-pointer ${
                          msg.unread ? "bg-gold/5 border border-gold/20" : "bg-muted/50 hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-foreground">{msg.from}</p>
                          <p className="text-xs text-muted-foreground">{msg.date}</p>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{msg.message}</p>
                      </div>
                    ))}
                  </div>
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

          {activeTab === "inspiration" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  Inspiration Boards
                </h1>
                <p className="text-muted-foreground mt-1">
                  Design concepts and mood boards for your project
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inspirations.map((board) => (
                  <div key={board.id} className="bg-card rounded-lg overflow-hidden shadow-soft">
                    <div 
                      className="aspect-video relative overflow-hidden cursor-pointer group"
                      onClick={() => handleOpenGallery(board.id)}
                    >
                      <img
                        src={board.coverImage}
                        alt={board.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium text-sm bg-black/30 px-3 py-1 rounded-full">
                          View Gallery ({board.gallery.length} images)
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                        {board.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">{board.notes}</p>
                      
                      {/* Design Items Section */}
                      {board.designItems.length > 0 && (
                        <div className="border-t border-border pt-4">
                          <h4 className="text-sm font-medium text-foreground mb-3">Selections & Materials</h4>
                          <div className="space-y-3">
                            {board.designItems.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground">{item.type}</p>
                                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                  {item.status === "approved" ? (
                                    <Button size="sm" variant="ghost" onClick={() => handleUndoItemApproval(board.id, item.id)} className="text-xs h-7">
                                      <CheckCircle className="w-3 h-3 mr-1 text-green-600" /> Undo
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="outline" onClick={() => handleApproveItem(board.id, item.id)} className="text-xs h-7">
                                      <ThumbsUp className="w-3 h-3 mr-1" /> Approve
                                    </Button>
                                  )}
                                  <Button size="sm" variant="ghost" onClick={() => handleViewItemComments(board.id, item.id)} className="text-xs h-7">
                                    <MessageSquare className="w-3 h-3 mr-1" /> Comment
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                        {rendering.status === "approved" ? "Approved" : rendering.status === "pending" ? "Pending Approval" : "Needs Revision"}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          {rendering.title}
                        </h3>
                        <button 
                          onClick={() => handleViewComments(rendering.id)}
                          className="text-sm text-muted-foreground hover:text-gold transition-colors"
                        >
                          {rendering.commentsList.length} comments
                        </button>
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
                      {rendering.status === "pending" && (
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
                      {/* Add Comment Button - available for all statuses */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => handleViewComments(rendering.id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View & Add Comments
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  Project Timeline
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track your project milestones
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-soft">
                <div className="space-y-6">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            milestone.status === "completed"
                              ? "bg-green-500/10 text-green-500"
                              : milestone.status === "in-progress"
                              ? "bg-gold/10 text-gold"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {milestone.status === "completed" ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : milestone.status === "in-progress" ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <AlertCircle className="w-5 h-5" />
                          )}
                        </div>
                        {index < milestones.length - 1 && (
                          <div
                            className={`w-0.5 flex-1 my-2 ${
                              milestone.status === "completed" ? "bg-green-500/30" : "bg-border"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-foreground">{milestone.title}</h3>
                          <span className="text-sm text-muted-foreground">{milestone.date}</span>
                        </div>
                        <span
                          className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                            milestone.status === "completed"
                              ? "bg-green-500/10 text-green-500"
                              : milestone.status === "in-progress"
                              ? "bg-gold/10 text-gold"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {milestone.status === "completed"
                            ? "Completed"
                            : milestone.status === "in-progress"
                            ? "In Progress"
                            : "Upcoming"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
                  {allMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] ${msg.sender === "client" ? "" : "flex gap-3"}`}>
                        {msg.sender !== "client" && (
                          <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-gold text-xs font-medium">SM</span>
                          </div>
                        )}
                        <div>
                          {msg.sender !== "client" && msg.name && (
                            <p className="text-xs text-muted-foreground mb-1">{msg.name}</p>
                          )}
                          <div
                            className={`rounded-lg p-3 ${
                              msg.sender === "client"
                                ? "bg-gold text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                          </div>
                          <p className={`text-xs mt-1 ${
                            msg.sender === "client" ? "text-right" : ""
                          } text-muted-foreground`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Input */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button variant="gold" onClick={handleSendMessage}>
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

      {/* Comments Modal */}
      <Dialog open={showCommentsModal} onOpenChange={setShowCommentsModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{getSelectedRendering()?.title} - Comments</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4 max-h-[400px]">
            {getSelectedRendering()?.commentsList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
            ) : (
              getSelectedRendering()?.commentsList.map((comment) => (
                <div 
                  key={comment.id} 
                  className={`p-3 rounded-lg ${
                    comment.sender === "client" 
                      ? "bg-gold/10 ml-8" 
                      : "bg-muted mr-8"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {comment.sender === "client" ? "You" : comment.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{comment.time}</span>
                  </div>
                  <p className="text-sm text-foreground">{comment.text}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2 pt-4 border-t border-border">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            />
            <Button variant="gold" onClick={handleAddComment}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Item Comments Modal */}
      <Dialog open={showItemCommentsModal} onOpenChange={setShowItemCommentsModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {getSelectedItem() && (
                <>
                  <img src={getSelectedItem()?.image} alt={getSelectedItem()?.name} className="w-12 h-12 rounded object-cover" />
                  <div>
                    <p className="text-xs text-muted-foreground">{getSelectedItem()?.type}</p>
                    <p className="font-medium">{getSelectedItem()?.name}</p>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4 max-h-[300px]">
            {getSelectedItem()?.commentsList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No comments yet on this item.</p>
            ) : (
              getSelectedItem()?.commentsList.map((comment: any) => (
                <div key={comment.id} className={`p-3 rounded-lg ${comment.sender === "client" ? "bg-gold/10 ml-8" : "bg-muted mr-8"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{comment.sender === "client" ? "You" : comment.name || "Designer"}</span>
                    <span className="text-xs text-muted-foreground">{comment.time}</span>
                  </div>
                  <p className="text-sm text-foreground">{comment.text}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2 pt-4 border-t border-border">
            <Input value={newItemComment} onChange={(e) => setNewItemComment(e.target.value)} placeholder="Add a comment..." className="flex-1" onKeyDown={(e) => e.key === "Enter" && handleAddItemComment()} />
            <Button variant="gold" onClick={handleAddItemComment}><Send className="w-4 h-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboard;
