import { useState, useEffect } from "react";
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
  Download,
  Archive,
  Eye,
  Package,
  ExternalLink,
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
import { useSharedInspirations, useSharedRenderings, useSharedDocuments } from "@/hooks/useSharedDesignState";
import { ImageUpload } from "@/components/ImageUpload";
import { FileUpload } from "@/components/FileUpload";
import { DocumentPreviewModal } from "@/components/DocumentPreviewModal";
import { supabase } from "@/integrations/supabase/client";

interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
  }>;
}

const AdminClientDetail = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [documents, setDocuments] = useSharedDocuments();
  const [inspirations, setInspirations] = useSharedInspirations();
  const [renderings, setRenderings] = useSharedRenderings();
  const [messages, setMessages] = useState<any[]>([]);

  // State for add project modal
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Helper to generate default project name from address
  const getDefaultProjectName = (address: string, email: string) => {
    if (address && address.trim()) {
      // Get first part of address (before first comma or first few words)
      const firstPart = address.split(",")[0].trim();
      return firstPart || `${email.split("@")[0]}'s Project`;
    }
    return `${email.split("@")[0]}'s Project`;
  };

  // Create a project for client
  const createProjectForClient = async (profileId: string, projectName: string) => {
    try {
      const { data: newProject, error } = await supabase
        .from("projects")
        .insert({
          client_id: profileId,
          name: projectName,
          status: "Planning",
          progress: 0,
        })
        .select("id, name, status, progress")
        .single();

      if (error) throw error;
      return newProject;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  };

  // Fetch client data from Supabase
  useEffect(() => {
    const fetchClientData = async () => {
      if (!clientId) return;
      
      setIsLoadingClient(true);
      try {
        // Fetch client profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, full_name, phone_number, address")
          .eq("id", clientId)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!profile) {
          toast.error("Client not found");
          navigate("/admin");
          return;
        }

        // Fetch projects for this client
        let { data: projects, error: projectsError } = await supabase
          .from("projects")
          .select("id, name, status, progress")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false });

        if (projectsError) throw projectsError;

        // If no projects, create a default one
        if (!projects || projects.length === 0) {
          const defaultName = getDefaultProjectName(profile.address || "", profile.email);
          const newProject = await createProjectForClient(profile.id, defaultName);
          projects = [newProject];
          toast.success(`Created project: ${defaultName}`);
        }

        setClient({
          id: profile.id,
          name: profile.full_name || profile.email,
          email: profile.email,
          phone: profile.phone_number || "",
          address: profile.address || "",
          projects: projects || [],
        });

        // Set first project as selected
        if (projects && projects.length > 0) {
          setSelectedProjectId(projects[0].id);
        }
      } catch (error) {
        console.error("Error fetching client:", error);
        toast.error("Failed to load client data");
      } finally {
        setIsLoadingClient(false);
      }
    };

    fetchClientData();
  }, [clientId, navigate]);

  // Handle adding a new project
  const handleAddProject = async () => {
    if (!client || !newProjectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    setIsCreatingProject(true);
    try {
      const newProject = await createProjectForClient(client.id, newProjectName.trim());
      
      setClient(prev => prev ? {
        ...prev,
        projects: [newProject, ...prev.projects],
      } : null);
      
      setSelectedProjectId(newProject.id);
      setNewProjectName("");
      setShowAddProjectModal(false);
      toast.success(`Created project: ${newProject.name}`);
    } catch (error) {
      toast.error("Failed to create project");
    } finally {
      setIsCreatingProject(false);
    }
  };
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [docTab, setDocTab] = useState<"sent" | "draft" | "archived">("sent");

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
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`messages-${selectedProjectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `project_id=eq.${selectedProjectId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as any]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedProjectId]);
  
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
  const [showDocPreviewModal, setShowDocPreviewModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
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
  const [newItem, setNewItem] = useState({ type: "", name: "", image: "", link: "", supplier: "" });
  const [addItemMode, setAddItemMode] = useState<"existing" | "new">("existing");
  const [selectedExistingProductId, setSelectedExistingProductId] = useState<string>("");
  const [uploadAsDraft, setUploadAsDraft] = useState(true);
  const [showAddProductToBoardModal, setShowAddProductToBoardModal] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [boardProducts, setBoardProducts] = useState<any[]>([]);
  const [loadingBoardProducts, setLoadingBoardProducts] = useState(false);
  const [boardDetailTab, setBoardDetailTab] = useState<"gallery" | "items" | "products">("gallery");
  const [clientImages, setClientImages] = useState<any[]>([]);

  // Fetch all products for the dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("product_inventory")
        .select("*")
        .order("category")
        .order("name");
      if (data) setAllProducts(data);
    };
    fetchProducts();
  }, []);

  // Fetch board products and client images when board detail modal opens
  useEffect(() => {
    if (showBoardDetailModal && selectedBoardId) {
      fetchBoardProducts();
      fetchClientImages();
    }
  }, [showBoardDetailModal, selectedBoardId]);

  const fetchBoardProducts = async () => {
    if (!selectedBoardId) return;
    setLoadingBoardProducts(true);
    try {
      const { data, error } = await supabase
        .from("board_products")
        .select(`
          id,
          product_id,
          product:product_inventory (
            id,
            name,
            category,
            supplier,
            link,
            image_url
          )
        `)
        .eq("mood_board_id", selectedBoardId.toString());

      if (!error && data) {
        setBoardProducts(data);
      }
    } catch (error) {
      console.error("Error fetching board products:", error);
    } finally {
      setLoadingBoardProducts(false);
    }
  };

  const fetchClientImages = async () => {
    if (!selectedBoardId) return;
    try {
      const { data, error } = await supabase
        .from("client_board_images")
        .select("*")
        .eq("mood_board_id", selectedBoardId.toString())
        .order("created_at", { ascending: false });

      if (!error && data) {
        setClientImages(data);
      }
    } catch (error) {
      console.error("Error fetching client images:", error);
    }
  };

  const handleAddProductToBoard = async () => {
    if (!selectedProductId || !selectedBoardId) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const { error } = await supabase.from("board_products").insert({
        mood_board_id: selectedBoardId.toString(),
        product_id: selectedProductId,
        added_by: user.id,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Product already added to this board");
        } else {
          throw error;
        }
      } else {
        toast.success("Product added to board");
        setShowAddProductToBoardModal(false);
        setSelectedProductId("");
        fetchBoardProducts();
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  const handleRemoveProductFromBoard = async (boardProductId: string) => {
    try {
      const { error } = await supabase
        .from("board_products")
        .delete()
        .eq("id", boardProductId);

      if (error) throw error;

      setBoardProducts(boardProducts.filter((bp) => bp.id !== boardProductId));
      toast.success("Product removed from board");
    } catch (error) {
      console.error("Error removing product:", error);
      toast.error("Failed to remove product");
    }
  };

  const handleDeleteClientImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from("client_board_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      setClientImages(clientImages.filter((img) => img.id !== imageId));
      toast.success("Client image removed");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to remove image");
    }
  };

  const getSelectedProject = () => client?.projects.find(p => p.id === selectedProjectId);

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedProjectId) return;
    
    try {
      const { error } = await supabase
        .from("projects")
        .update({ status: newStatus })
        .eq("id", selectedProjectId);

      if (error) throw error;

      setClient(prev => prev ? {
        ...prev,
        projects: prev.projects.map(p => 
          p.id === selectedProjectId ? { ...p, status: newStatus } : p
        )
      } : null);
      toast.success(`Project status changed to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Document handlers
  const handleDocumentUpload = (file: { name: string; size: string; type: string; data: string }) => {
    const newDoc = {
      id: Math.max(...documents.map(d => d.id), 0) + 1,
      name: file.name,
      size: file.size,
      type: file.type,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      data: file.data,
      status: uploadAsDraft ? "draft" as const : "sent" as const
    };
    setDocuments([...documents, newDoc]);
    setShowUploadDocModal(false);
    toast.success(uploadAsDraft ? "Document saved as draft" : "Document sent to client");
  };

  const handleDeleteDocument = (docId: number) => {
    setDocuments(documents.filter(d => d.id !== docId));
    toast.success("Document deleted");
  };

  const handleSendDocument = (docId: number) => {
    setDocuments(documents.map(d => d.id === docId ? { ...d, status: "sent" as const } : d));
    toast.success("Document sent to client");
  };

  const handleArchiveDocument = (docId: number) => {
    setDocuments(documents.map(d => d.id === docId ? { ...d, status: "archived" as const } : d));
    toast.success("Document archived");
  };

  const handleUnarchiveDocument = (docId: number) => {
    setDocuments(documents.map(d => d.id === docId ? { ...d, status: "sent" as const } : d));
    toast.success("Document restored from archive");
  };

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

  const getSelectedDocument = () => documents.find(d => d.id === selectedDocId);

  const filteredDocuments = documents.filter(d => d.status === docTab);

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

  const handleAddDesignItem = async () => {
    if (addItemMode === "existing") {
      // Add from existing product
      if (!selectedExistingProductId) {
        toast.error("Please select a product");
        return;
      }
      const product = allProducts.find(p => p.id === selectedExistingProductId);
      if (!product) {
        toast.error("Product not found");
        return;
      }
      setInspirations(inspirations.map(board => 
        board.id === selectedBoardId 
          ? { 
              ...board, 
              designItems: [...board.designItems, {
                id: Math.max(...board.designItems.map(i => i.id), 0) + 1,
                type: product.category,
                name: product.name,
                image: product.image_url || "",
                link: product.link || "",
                status: "pending",
                commentsList: []
              }]
            }
          : board
      ));
      setSelectedExistingProductId("");
      setShowAddItemModal(false);
      toast.success("Product added to board");
    } else {
      // Add new product - also save to inventory
      if (!newItem.type.trim() || !newItem.name.trim()) {
        toast.error("Please fill in category and name");
        return;
      }

      try {
        // First, add to product inventory
        const { data: newProduct, error } = await supabase
          .from("product_inventory")
          .insert({
            name: newItem.name,
            category: newItem.type,
            image_url: newItem.image || null,
            link: newItem.link || null,
            supplier: newItem.supplier || null,
          })
          .select()
          .single();

        if (error) throw error;

        // Add to allProducts state
        setAllProducts([...allProducts, newProduct]);

        // Add to board
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
        
        setNewItem({ type: "", name: "", image: "", link: "", supplier: "" });
        setShowAddItemModal(false);
        toast.success("New product added to inventory and board");
      } catch (error) {
        console.error("Error adding product:", error);
        toast.error("Failed to add product");
      }
    }
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedProjectId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to send messages");
        return;
      }

      const { error } = await supabase.from("messages").insert({
        project_id: selectedProjectId,
        sender_id: user.id,
        text: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
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

  if (isLoadingClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Client not found</p>
          <Button onClick={() => navigate("/admin")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

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
            <p className="text-sm text-muted-foreground">
              {getSelectedProject()?.name || "No project assigned"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {client.projects.length > 0 && (
              <Select value={selectedProjectId || ""} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {client.projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setNewProjectName("");
                setShowAddProjectModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Project
            </Button>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              getSelectedProject()?.status === "In Progress" ? "bg-gold/10 text-gold" :
              getSelectedProject()?.status === "Completed" ? "bg-green-500/10 text-green-600" :
              "bg-muted text-muted-foreground"
            }`}>
              {getSelectedProject()?.status || "New"}
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
                    <Select value={getSelectedProject()?.status || "New"} onValueChange={handleStatusChange}>
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
              <Button variant="gold" onClick={() => { setUploadAsDraft(true); setShowUploadDocModal(true); }}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            {/* Document Tabs */}
            <div className="flex gap-2 border-b border-border">
              <button
                onClick={() => setDocTab("sent")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  docTab === "sent" ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Sent ({documents.filter(d => d.status === "sent").length})
              </button>
              <button
                onClick={() => setDocTab("draft")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  docTab === "draft" ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Drafts ({documents.filter(d => d.status === "draft").length})
              </button>
              <button
                onClick={() => setDocTab("archived")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  docTab === "archived" ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Archive ({documents.filter(d => d.status === "archived").length})
              </button>
            </div>

            <div className="bg-card rounded-lg shadow-soft overflow-hidden">
              {filteredDocuments.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {docTab === "sent" && "No documents sent to client yet"}
                    {docTab === "draft" && "No draft documents"}
                    {docTab === "archived" && "No archived documents"}
                  </p>
                  {docTab === "draft" && (
                    <Button variant="outline" className="mt-4" onClick={() => { setUploadAsDraft(true); setShowUploadDocModal(true); }}>
                      Upload Draft
                    </Button>
                  )}
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => handlePreviewDocument(doc.id)}>
                      <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.size} • {doc.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status === "draft" && (
                        <Button size="sm" variant="gold" onClick={() => handleSendDocument(doc.id)}>
                          <Send className="w-4 h-4 mr-1" />
                          Send
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreviewDocument(doc.id)}>
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadDocument(doc)}>
                            Download
                          </DropdownMenuItem>
                          {doc.status === "draft" && (
                            <DropdownMenuItem onClick={() => handleSendDocument(doc.id)}>
                              Send to Client
                            </DropdownMenuItem>
                          )}
                          {doc.status === "sent" && (
                            <DropdownMenuItem onClick={() => handleArchiveDocument(doc.id)}>
                              Move to Archive
                            </DropdownMenuItem>
                          )}
                          {doc.status === "archived" && (
                            <DropdownMenuItem onClick={() => handleUnarchiveDocument(doc.id)}>
                              Restore from Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteDocument(doc.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isAdmin = msg.sender_id !== client?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isAdmin
                              ? "bg-gold text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {/* Reference card for messages about specific items */}
                          {msg.reference_type && msg.reference_title && (
                            <div 
                              className={`flex items-center gap-2 p-2 rounded mb-2 ${
                                isAdmin ? "bg-primary-foreground/10" : "bg-background/50"
                              }`}
                            >
                              {msg.reference_image_url && (
                                <img 
                                  src={msg.reference_image_url} 
                                  alt={msg.reference_title}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs ${isAdmin ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                  Re: {msg.reference_type === "rendering" ? "Rendering" : "Inspiration"}
                                </p>
                                <p className="text-sm font-medium truncate">{msg.reference_title}</p>
                              </div>
                            </div>
                          )}
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            isAdmin ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
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
          <div className="space-y-4 py-4">
            <FileUpload onFileSelect={handleDocumentUpload} />
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                id="upload-as-draft"
                checked={uploadAsDraft}
                onChange={(e) => setUploadAsDraft(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="upload-as-draft" className="text-sm text-foreground cursor-pointer">
                Save as draft (don't send to client yet)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDocModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        open={showDocPreviewModal}
        onOpenChange={setShowDocPreviewModal}
        document={getSelectedDocument()}
        onDownload={handleDownloadDocument}
        onSend={handleSendDocument}
        isAdmin={true}
      />

      {/* Board Detail Modal */}
      <Dialog open={showBoardDetailModal} onOpenChange={setShowBoardDetailModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {getSelectedBoard()?.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{getSelectedBoard()?.notes}</p>
          </DialogHeader>
          
          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            <button
              onClick={() => setBoardDetailTab("gallery")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                boardDetailTab === "gallery" ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Gallery ({(getSelectedBoard()?.gallery.length || 0) + clientImages.length})
            </button>
            <button
              onClick={() => setBoardDetailTab("items")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                boardDetailTab === "items" ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Selections ({getSelectedBoard()?.designItems.length || 0})
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* Gallery Tab */}
            {boardDetailTab === "gallery" && (
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
                  {/* Client uploaded images */}
                  {clientImages.map((img) => (
                    <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden">
                      <img src={img.image_url} alt="Client upload" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-background/80 rounded text-xs text-muted-foreground">
                        Client
                      </span>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => handleDeleteClientImage(img.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(getSelectedBoard()?.gallery.length === 0 && clientImages.length === 0) && (
                    <div className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                      No images yet
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items Tab */}
            {boardDetailTab === "items" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">Selections & Materials</h3>
                  <Button size="sm" variant="outline" onClick={() => { setNewItem({ type: "", name: "", image: "", link: "", supplier: "" }); setAddItemMode("existing"); setSelectedExistingProductId(""); setShowAddItemModal(true); }}>
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
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getItemStatusColor(item.status)}`}>
                          {item.status === "approved" ? "Approved" : "Pending"}
                        </span>
                        <Button size="sm" variant="ghost" className="h-7" onClick={(e) => { e.stopPropagation(); handleDeleteDesignItem(item.id); }}>
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
            )}
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
            <DialogTitle className="font-display">Add Selection / Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setAddItemMode("existing")}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  addItemMode === "existing" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                From Inventory
              </button>
              <button
                onClick={() => setAddItemMode("new")}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  addItemMode === "new" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Add New Product
              </button>
            </div>

            {addItemMode === "existing" ? (
              <div className="space-y-2">
                <Label>Select Product</Label>
                <Select value={selectedExistingProductId} onValueChange={setSelectedExistingProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose from inventory..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center gap-2">
                          {product.image_url && (
                            <img src={product.image_url} alt="" className="w-6 h-6 rounded object-cover" />
                          )}
                          <span>{product.name}</span>
                          <span className="text-muted-foreground">({product.category})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedExistingProductId && (() => {
                  const product = allProducts.find(p => p.id === selectedExistingProductId);
                  return product ? (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg flex items-center gap-3">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        {product.supplier && <p className="text-xs text-muted-foreground">{product.supplier}</p>}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="item-type">Category *</Label>
                  <Select value={newItem.type} onValueChange={(val) => setNewItem({ ...newItem, type: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixtures">Fixtures</SelectItem>
                      <SelectItem value="Paint Colors">Paint Colors</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Lighting">Lighting</SelectItem>
                      <SelectItem value="Textiles & Rugs">Textiles & Rugs</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-name">Name *</Label>
                  <Input
                    id="item-name"
                    placeholder="e.g., Benjamin Moore - Simply White"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-supplier">Supplier (optional)</Label>
                  <Input
                    id="item-supplier"
                    placeholder="e.g., West Elm, RH, Custom"
                    value={newItem.supplier}
                    onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Product Image (optional)</Label>
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
                <p className="text-xs text-muted-foreground">
                  This product will also be added to your product inventory.
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="gold" 
              onClick={handleAddDesignItem}
              disabled={addItemMode === "existing" ? !selectedExistingProductId : !newItem.type || !newItem.name}
            >
              {addItemMode === "existing" ? "Add to Board" : "Create & Add"}
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

      {/* Add Project Modal */}
      <Dialog open={showAddProjectModal} onOpenChange={setShowAddProjectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Living Room Renovation"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProjectModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="gold" 
              onClick={handleAddProject}
              disabled={isCreatingProject || !newProjectName.trim()}
            >
              {isCreatingProject ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClientDetail;
