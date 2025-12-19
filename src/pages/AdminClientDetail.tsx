import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  FileText,
  Image,
  Palette,
  MessageSquare,
  CheckCircle,
  Clock,
  Upload,
  Send,
  Plus,
  X,
  Edit,
  MoreHorizontal,
  Trash2,
  PauseCircle,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSharedInspirations, useSharedRenderings } from "@/hooks/useSharedDesignState";
import { ImageUpload } from "@/components/ImageUpload";
import { FileUpload } from "@/components/FileUpload";

// Mock client data
const clientsData: Record<number, any> = {
  1: { id: 1, name: "John Smith", email: "john@example.com", phone: "+1 555-0101", project: "Modern Penthouse Renovation", status: "In Progress", address: "123 Park Avenue, NYC" },
  2: { id: 2, name: "Sarah Johnson", email: "sarah@example.com", phone: "+1 555-0102", project: "Coastal Beach House", status: "In Progress", address: "456 Ocean Drive, Miami" },
  3: { id: 3, name: "Michael Chen", email: "michael@example.com", phone: "+1 555-0103", project: "Minimalist Loft", status: "Completed", address: "789 Design St, LA" },
  4: { id: 4, name: "Emily Davis", email: "emily@example.com", phone: "+1 555-0104", project: "Urban Studio Apartment", status: "In Progress", address: "321 Metro Blvd, Chicago" },
  5: { id: 5, name: "Robert Wilson", email: "robert@example.com", phone: "+1 555-0105", project: "Classic Colonial Refresh", status: "On Hold", address: "654 Heritage Lane, Boston" },
};

const mockDocuments = [
  { id: 1, name: "Design Concept v2.pdf", type: "PDF", date: "Dec 15, 2024", size: "2.4 MB" },
  { id: 2, name: "Floor Plan Final.pdf", type: "PDF", date: "Dec 10, 2024", size: "1.8 MB" },
  { id: 3, name: "Material Selections.pdf", type: "PDF", date: "Dec 5, 2024", size: "3.2 MB" },
];

const mockMessages = [
  { id: 1, sender: "admin", text: "Hi John! The furniture samples have arrived. When can you come to the showroom?", time: "10:30 AM" },
  { id: 2, sender: "client", text: "That's great news! I can come by tomorrow afternoon, around 2pm?", time: "10:45 AM" },
  { id: 3, sender: "admin", text: "Perfect! I'll have everything set up for you. Looking forward to seeing you!", time: "10:48 AM" },
  { id: 4, sender: "client", text: "Thank you! Can you also have the fabric swatches ready?", time: "11:02 AM" },
];

const AdminClientDetail = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const clientData = clientsData[Number(clientId)] || clientsData[1];
  
  const [client, setClient] = useState(clientData);
  const [activeTab, setActiveTab] = useState("overview");
  const [documents, setDocuments] = useState(mockDocuments);
  const [inspirations, setInspirations] = useSharedInspirations();
  const [renderings, setRenderings] = useSharedRenderings();
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  
  // Modal states
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);
  const [showAddRenderingModal, setShowAddRenderingModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showItemCommentsModal, setShowItemCommentsModal] = useState(false);
  const [showBoardDetailModal, setShowBoardDetailModal] = useState(false);
  const [showAddGalleryImageModal, setShowAddGalleryImageModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [editingRendering, setEditingRendering] = useState<any>(null);
  const [editingBoard, setEditingBoard] = useState<any>(null);
  const [selectedRenderingId, setSelectedRenderingId] = useState<number | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [newItemComment, setNewItemComment] = useState("");
  
  // Form states
  const [newBoard, setNewBoard] = useState({ title: "", image: "", notes: "" });
  const [newRendering, setNewRendering] = useState({ title: "", image: "" });
  const [newGalleryImage, setNewGalleryImage] = useState("");
  const [newItem, setNewItem] = useState({ type: "", name: "", image: "", link: "" });

  const handleStatusChange = (newStatus: string) => {
    setClient({ ...client, status: newStatus });
    toast.success(`Project status changed to ${newStatus}`);
  };

  // Document upload handler
  const handleDocumentUpload = (file: { name: string; size: string; type: string; data: string }) => {
    const newDoc = {
      id: Math.max(...documents.map(d => d.id), 0) + 1,
      name: file.name,
      size: file.size,
      type: file.type,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      data: file.data
    };
    setDocuments([...documents, newDoc]);
    setShowUploadDocModal(false);
    toast.success("Document uploaded successfully");
  };

  const handleDeleteDocument = (docId: number) => {
    setDocuments(documents.filter(d => d.id !== docId));
    toast.success("Document deleted");
  };

  // Board detail handlers
  const handleOpenBoardDetail = (boardId: number) => {
    setSelectedBoardId(boardId);
    setGalleryIndex(0);
    setShowBoardDetailModal(true);
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryImage.trim()) return;
    setInspirations(inspirations.map(board => 
      board.id === selectedBoardId 
        ? { ...board, gallery: [...board.gallery, newGalleryImage] }
        : board
    ));
    setNewGalleryImage("");
    setShowAddGalleryImageModal(false);
    toast.success("Image added to gallery");
  };

  const handleDeleteGalleryImage = (imageIndex: number) => {
    setInspirations(inspirations.map(board => 
      board.id === selectedBoardId 
        ? { ...board, gallery: board.gallery.filter((_, idx) => idx !== imageIndex) }
        : board
    ));
    toast.success("Image removed from gallery");
  };

  const handleAddDesignItem = () => {
    if (!newItem.type.trim() || !newItem.name.trim() || !newItem.image.trim()) {
      toast.error("Please fill in type, name, and image");
      return;
    }
    setInspirations(inspirations.map(board => 
      board.id === selectedBoardId 
        ? { 
            ...board, 
            designItems: [...board.designItems, {
              id: Math.max(...board.designItems.map(i => i.id), 0) + 1,
              type: newItem.type,
              name: newItem.name,
              image: newItem.image,
              link: newItem.link,
              status: "pending",
              commentsList: []
            }]
          }
        : board
    ));
    setNewItem({ type: "", name: "", image: "", link: "" });
    setShowAddItemModal(false);
    toast.success("Item added successfully");
  };

  const handleDeleteDesignItem = (itemId: number) => {
    setInspirations(inspirations.map(board => 
      board.id === selectedBoardId 
        ? { ...board, designItems: board.designItems.filter(i => i.id !== itemId) }
        : board
    ));
    toast.success("Item removed");
  };

  const handleViewItemDetail = (boardId: number, itemId: number) => {
    setSelectedBoardId(boardId);
    setSelectedItemId(itemId);
    setShowItemDetailModal(true);
  };

  const handleOpenGallery = (boardId: number) => {
    setSelectedBoardId(boardId);
    setGalleryIndex(0);
    setShowGalleryModal(true);
  };

  const getSelectedBoard = () => inspirations.find(b => b.id === selectedBoardId);

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
                      sender: "admin",
                      name: "You",
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

  const getSelectedItem = () => {
    const board = inspirations.find(b => b.id === selectedBoardId);
    return board?.designItems.find(item => item.id === selectedItemId);
  };

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500/10 text-green-600";
      case "pending": return "bg-gold/10 text-gold";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "inspiration", label: "Inspiration Boards", icon: Palette },
    { id: "renderings", label: "Renderings", icon: Image },
    { id: "chat", label: "Chat", icon: MessageSquare },
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, {
      id: messages.length + 1,
      sender: "admin",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setNewMessage("");
    toast.success("Message sent");
  };

  // Rendering workflow handlers
  const handleSendRendering = (id: number) => {
    setRenderings(renderings.map(r => r.id === id ? { ...r, status: "sent" } : r));
    toast.success("Rendering sent to client");
  };

  const handleMarkComplete = (id: number) => {
    setRenderings(renderings.map(r => r.id === id ? { ...r, status: "completed" } : r));
    toast.success("Rendering marked as complete");
  };

  const handleEditRendering = (rendering: any) => {
    setEditingRendering(rendering);
    setNewRendering({ title: rendering.title, image: rendering.image });
    setShowAddRenderingModal(true);
  };

  const handleSaveRendering = () => {
    if (!newRendering.title.trim() || !newRendering.image.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (editingRendering) {
      setRenderings(renderings.map(r => 
        r.id === editingRendering.id 
          ? { ...r, title: newRendering.title, image: newRendering.image }
          : r
      ));
      toast.success("Rendering updated");
    } else {
      const newId = Math.max(...renderings.map(r => r.id)) + 1;
      setRenderings([...renderings, {
        id: newId,
        title: newRendering.title,
        image: newRendering.image,
        status: "draft",
        commentsList: []
      }]);
      toast.success("Rendering added as draft");
    }
    
    setShowAddRenderingModal(false);
    setEditingRendering(null);
    setNewRendering({ title: "", image: "" });
  };

  // Inspiration board handlers
  const handleEditBoard = (board: any) => {
    setEditingBoard(board);
    setNewBoard({ title: board.title, image: board.coverImage, notes: board.notes });
    setShowAddBoardModal(true);
  };

  const handleSaveBoard = () => {
    if (!newBoard.title.trim() || !newBoard.image.trim()) {
      toast.error("Please fill in title and image URL");
      return;
    }
    
    if (editingBoard) {
      setInspirations(inspirations.map(b => 
        b.id === editingBoard.id 
          ? { ...b, title: newBoard.title, coverImage: newBoard.image, notes: newBoard.notes }
          : b
      ));
      toast.success("Inspiration board updated");
    } else {
      const newId = Math.max(...inspirations.map(b => b.id)) + 1;
      setInspirations([...inspirations, {
        id: newId,
        title: newBoard.title,
        coverImage: newBoard.image,
        notes: newBoard.notes,
        gallery: [newBoard.image],
        designItems: []
      }]);
      toast.success("Inspiration board added");
    }
    
    setShowAddBoardModal(false);
    setEditingBoard(null);
    setNewBoard({ title: "", image: "", notes: "" });
  };

  const handleDeleteBoard = (id: number) => {
    setInspirations(inspirations.filter(b => b.id !== id));
    toast.success("Inspiration board deleted");
  };

  const handleDeleteRendering = (id: number) => {
    setRenderings(renderings.filter(r => r.id !== id));
    toast.success("Rendering deleted");
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
              sender: "admin",
              name: "You",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": 
      case "approved": return "bg-green-500/10 text-green-600";
      case "sent": 
      case "pending": return "bg-gold/10 text-gold";
      case "revision": return "bg-orange-500/10 text-orange-600";
      case "draft": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Completed";
      case "approved": return "Client Approved";
      case "sent": return "Sent to Client";
      case "pending": return "Awaiting Approval";
      case "revision": return "Revision Requested";
      case "draft": return "Draft";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-semibold text-foreground">
              {client.name}
            </h1>
            <p className="text-sm text-muted-foreground">{client.project}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              client.status === "In Progress" ? "bg-gold/10 text-gold" :
              client.status === "Completed" ? "bg-green-500/10 text-green-600" :
              "bg-muted text-muted-foreground"
            }`}>
              {client.status}
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-gold text-gold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Client Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-lg p-6 shadow-soft">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  Client Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{client.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{client.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium text-foreground">{client.address}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-soft">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  Project Status
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="project-status" className="text-sm text-muted-foreground">Current Status</Label>
                    <Select value={client.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Progress">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gold" />
                            In Progress
                          </div>
                        </SelectItem>
                        <SelectItem value="Completed">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Completed
                          </div>
                        </SelectItem>
                        <SelectItem value="On Hold">
                          <div className="flex items-center gap-2">
                            <PauseCircle className="w-4 h-4 text-muted-foreground" />
                            On Hold
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 shadow-soft">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Documents</span>
                    <span className="font-medium text-foreground">{documents.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Inspiration Boards</span>
                    <span className="font-medium text-foreground">{inspirations.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Renderings</span>
                    <span className="font-medium text-foreground">{renderings.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pending Approvals</span>
                    <span className="font-medium text-gold">{renderings.filter(r => r.status === "pending").length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-foreground">Documents</h2>
              <Button variant="gold" onClick={() => setShowUploadDocModal(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
            <div className="bg-card rounded-lg shadow-soft overflow-hidden">
              {documents.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No documents yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowUploadDocModal(true)}>
                    Upload First Document
                  </Button>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.size} • {doc.date}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>Share with Client</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteDocument(doc.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Inspiration Boards Tab */}
        {activeTab === "inspiration" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-foreground">Inspiration Boards</h2>
              <Button variant="gold" onClick={() => { setEditingBoard(null); setNewBoard({ title: "", image: "", notes: "" }); setShowAddBoardModal(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Board
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inspirations.map((board) => (
                <div key={board.id} className="bg-card rounded-lg overflow-hidden shadow-soft cursor-pointer hover:shadow-medium transition-shadow" onClick={() => handleOpenBoardDetail(board.id)}>
                  {/* Clickable Gallery Cover */}
                  <div className="aspect-video relative overflow-hidden group">
                    <img
                      src={board.coverImage}
                      alt={board.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-medium text-sm bg-black/30 px-3 py-1 rounded-full">
                        View Details
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {board.title}
                      </h3>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost" onClick={() => handleEditBoard(board)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteBoard(board.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{board.notes}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{board.gallery.length} images</span>
                      <span>{board.designItems.length} items</span>
                    </div>
                  </div>
                </div>
              ))}
              {/* Add new board card */}
              <div 
                className="bg-card rounded-lg border-2 border-dashed border-border flex items-center justify-center min-h-[250px] cursor-pointer hover:border-gold/50 transition-colors"
                onClick={() => { setEditingBoard(null); setNewBoard({ title: "", image: "", notes: "" }); setShowAddBoardModal(true); }}
              >
                <div className="text-center">
                  <Plus className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Add New Board</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Renderings Tab */}
        {activeTab === "renderings" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-foreground">Renderings</h2>
              <Button variant="gold" onClick={() => { setEditingRendering(null); setNewRendering({ title: "", image: "" }); setShowAddRenderingModal(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Rendering
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderings.map((rendering) => (
                <div key={rendering.id} className="bg-card rounded-lg overflow-hidden shadow-soft">
                  <div className="aspect-video relative">
                    <img
                      src={rendering.image}
                      alt={rendering.title}
                      className="w-full h-full object-cover"
                    />
                    <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rendering.status)}`}>
                      {getStatusLabel(rendering.status)}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {rendering.title}
                      </h3>
                      {rendering.status !== "draft" && (
                        <button 
                          onClick={() => handleViewComments(rendering.id)}
                          className="text-sm text-muted-foreground hover:text-gold transition-colors"
                        >
                          {rendering.commentsList.length} comments
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {rendering.status === "draft" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEditRendering(rendering)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="gold"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleSendRendering(rendering.id)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send
                          </Button>
                        </>
                      )}
                      {rendering.status === "sent" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEditRendering(rendering)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="gold"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleMarkComplete(rendering.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </Button>
                        </>
                      )}
                      {rendering.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </Button>
                      )}
                      {rendering.status !== "draft" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewComments(rendering.id)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRendering(rendering.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {/* Add new rendering card */}
              <div 
                className="bg-card rounded-lg border-2 border-dashed border-border flex items-center justify-center min-h-[300px] cursor-pointer hover:border-gold/50 transition-colors"
                onClick={() => { setEditingRendering(null); setNewRendering({ title: "", image: "" }); setShowAddRenderingModal(true); }}
              >
                <div className="text-center">
                  <Plus className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Add New Rendering</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
              Chat with {client.name}
            </h2>
            <div className="bg-card rounded-lg shadow-soft overflow-hidden">
              {/* Messages */}
              <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender === "admin"
                          ? "bg-gold text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === "admin" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {msg.time}
                      </p>
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
      </main>

      {/* Add/Edit Inspiration Board Modal */}
      <Dialog open={showAddBoardModal} onOpenChange={setShowAddBoardModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingBoard ? "Edit Inspiration Board" : "Add Inspiration Board"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="board-title">Title</Label>
              <Input
                id="board-title"
                placeholder="e.g., Living Room Mood"
                value={newBoard.title}
                onChange={(e) => setNewBoard({ ...newBoard, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <ImageUpload
                value={newBoard.image}
                onChange={(url) => setNewBoard({ ...newBoard, image: url })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="board-notes">Notes</Label>
              <Textarea
                id="board-notes"
                placeholder="Describe the mood and style..."
                value={newBoard.notes}
                onChange={(e) => setNewBoard({ ...newBoard, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBoardModal(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleSaveBoard}>
              {editingBoard ? "Save Changes" : "Add Board"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Rendering Modal */}
      <Dialog open={showAddRenderingModal} onOpenChange={setShowAddRenderingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingRendering ? "Edit Rendering" : "Add Rendering"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rendering-title">Title</Label>
              <Input
                id="rendering-title"
                placeholder="e.g., Living Room - Option A"
                value={newRendering.title}
                onChange={(e) => setNewRendering({ ...newRendering, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Rendering Image</Label>
              <ImageUpload
                value={newRendering.image}
                onChange={(url) => setNewRendering({ ...newRendering, image: url })}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {editingRendering 
                ? "Update the rendering details and save." 
                : "New renderings will be saved as drafts. You can send them to the client when ready."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRenderingModal(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleSaveRendering}>
              {editingRendering ? "Save Changes" : "Add as Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Modal */}
      <Dialog open={showCommentsModal} onOpenChange={setShowCommentsModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{getSelectedRendering()?.title} - Comments</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4 max-h-[400px]">
            {getSelectedRendering()?.commentsList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No comments yet. Start the conversation!</p>
            ) : (
              getSelectedRendering()?.commentsList.map((comment) => (
                <div 
                  key={comment.id} 
                  className={`p-3 rounded-lg ${
                    comment.sender === "admin" 
                      ? "bg-gold/10 ml-8" 
                      : "bg-muted mr-8"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {comment.sender === "admin" ? "You" : comment.name}
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
              placeholder="Reply to client..."
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevImage}
                    disabled={galleryIndex === 0}
                    className="bg-background/80 hover:bg-background ml-2"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextImage}
                    disabled={galleryIndex === (getSelectedBoard()?.gallery.length || 1) - 1}
                    className="bg-background/80 hover:bg-background mr-2"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
                  {galleryIndex + 1} / {getSelectedBoard()?.gallery.length}
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto py-2">
            {getSelectedBoard()?.gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setGalleryIndex(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  idx === galleryIndex ? "border-gold" : "border-transparent"
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
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
                <div 
                  key={comment.id} 
                  className={`p-3 rounded-lg ${
                    comment.sender === "admin" 
                      ? "bg-gold/10 ml-8" 
                      : "bg-muted mr-8"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {comment.sender === "admin" ? "You" : comment.name || "Client"}
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
              value={newItemComment}
              onChange={(e) => setNewItemComment(e.target.value)}
              placeholder="Add a comment about this item..."
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAddItemComment()}
            />
            <Button variant="gold" onClick={handleAddItemComment}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Document Modal */}
      <Dialog open={showUploadDocModal} onOpenChange={setShowUploadDocModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Upload Document</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <FileUpload onFileSelect={handleDocumentUpload} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDocModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Board Detail Modal */}
      <Dialog open={showBoardDetailModal} onOpenChange={setShowBoardDetailModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {getSelectedBoard()?.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{getSelectedBoard()?.notes}</p>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* Gallery Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">Gallery Images</h3>
                <Button size="sm" variant="outline" onClick={() => { setNewGalleryImage(""); setShowAddGalleryImageModal(true); }}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Image
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {getSelectedBoard()?.gallery.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden">
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => { setGalleryIndex(idx); setShowGalleryModal(true); }}>
                        <Image className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => handleDeleteGalleryImage(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {getSelectedBoard()?.gallery.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    No images yet
                  </div>
                )}
              </div>
            </div>

            {/* Materials Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">Selections & Materials</h3>
                <Button size="sm" variant="outline" onClick={() => { setNewItem({ type: "", name: "", image: "", link: "" }); setShowAddItemModal(true); }}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getSelectedBoard()?.designItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleViewItemDetail(selectedBoardId!, item.id)}
                  >
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      {item.link && (
                        <p className="text-xs text-gold truncate">Has link</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getItemStatusColor(item.status)}`}>
                        {item.status === "approved" ? "Approved" : "Pending"}
                      </span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-7"
                        onClick={(e) => { e.stopPropagation(); handleDeleteDesignItem(item.id); }}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {getSelectedBoard()?.designItems.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    No items yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Gallery Image Modal */}
      <Dialog open={showAddGalleryImageModal} onOpenChange={setShowAddGalleryImageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add Gallery Image</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ImageUpload
              value={newGalleryImage}
              onChange={setNewGalleryImage}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGalleryImageModal(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleAddGalleryImage} disabled={!newGalleryImage}>
              Add Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Design Item Modal */}
      <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add Material / Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-type">Type</Label>
              <Input
                id="item-type"
                placeholder="e.g., Paint Color, Sofa, Faucet"
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-name">Name / Description</Label>
              <Input
                id="item-name"
                placeholder="e.g., Benjamin Moore - Simply White"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Item Image</Label>
              <ImageUpload
                value={newItem.image}
                onChange={(url) => setNewItem({ ...newItem, image: url })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-link">Product Link (optional)</Label>
              <Input
                id="item-link"
                placeholder="https://..."
                value={newItem.link}
                onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemModal(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleAddDesignItem}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Detail Modal */}
      <Dialog open={showItemDetailModal} onOpenChange={setShowItemDetailModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Item Details</DialogTitle>
          </DialogHeader>
          {getSelectedItem() && (
            <div className="space-y-4 py-4">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img src={getSelectedItem()?.image} alt={getSelectedItem()?.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{getSelectedItem()?.type}</p>
                <p className="text-lg font-medium text-foreground">{getSelectedItem()?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getItemStatusColor(getSelectedItem()?.status || "pending")}`}>
                  {getSelectedItem()?.status === "approved" ? "Client Approved" : "Pending Approval"}
                </span>
              </div>
              {getSelectedItem()?.link && (
                <div>
                  <Label className="text-sm text-muted-foreground">Product Link</Label>
                  <a 
                    href={getSelectedItem()?.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block mt-1 text-gold hover:underline truncate"
                  >
                    {getSelectedItem()?.link}
                  </a>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => { setShowItemDetailModal(false); handleViewItemComments(selectedBoardId!, selectedItemId!); }}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Comments
                </Button>
                {getSelectedItem()?.link && (
                  <Button variant="gold" className="flex-1" onClick={() => window.open(getSelectedItem()?.link, '_blank')}>
                    Open Link
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClientDetail;
