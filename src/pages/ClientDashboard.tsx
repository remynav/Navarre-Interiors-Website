import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Home,
  FileText,
  Calendar,
  MessageSquare,
  Settings,
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
  ThumbsDown,
  Send,
} from "lucide-react";
import { toast } from "sonner";

// Mock data for demo
const projectData = {
  name: "Modern Penthouse Renovation",
  status: "In Progress",
  progress: 65,
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

const documents = [
  { id: 1, name: "Design Concept Presentation", type: "PDF", date: "Nov 5" },
  { id: 2, name: "Floor Plan - Final", type: "PDF", date: "Nov 12" },
  { id: 3, name: "Material Selections", type: "PDF", date: "Nov 20" },
  { id: 4, name: "Furniture Quote", type: "PDF", date: "Dec 1" },
];

const inspirations = [
  { id: 1, title: "Living Room Mood", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400", notes: "Warm neutrals with brass accents" },
  { id: 2, title: "Kitchen Concept", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400", notes: "Modern minimalist with marble" },
  { id: 3, title: "Bedroom Vision", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400", notes: "Serene and organic textures" },
];

const renderings = [
  { id: 1, title: "Living Room - Option A", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600", status: "approved", comments: 3 },
  { id: 2, title: "Kitchen Rendering", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600", status: "pending", comments: 1 },
  { id: 3, title: "Master Bedroom", image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600", status: "revision", comments: 5 },
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

  // Check if logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("clientLoggedIn");
    if (isLoggedIn !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("clientLoggedIn");
    toast.success("Logged out successfully");
    navigate("/login");
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

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "inspiration", label: "Inspiration", icon: Palette },
    { id: "renderings", label: "Renderings", icon: Image },
    { id: "timeline", label: "Timeline", icon: Calendar },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
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
            <Link to="/" className="font-display text-2xl font-semibold text-foreground">
              Maison<span className="text-gold">.</span>
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

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{projectData.progress}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-500"
                      style={{ width: `${projectData.progress}%` }}
                    />
                  </div>
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
              <div className="bg-card rounded-lg p-6 shadow-soft">
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">{doc.type} • Added {doc.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
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
                  <div key={board.id} className="bg-card rounded-lg overflow-hidden shadow-soft group">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={board.image}
                        alt={board.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                        {board.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{board.notes}</p>
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
                {renderings.map((rendering) => (
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
                        <span className="text-sm text-muted-foreground">{rendering.comments} comments</span>
                      </div>
                      {rendering.status === "pending" && (
                        <div className="flex gap-2">
                          <Button variant="gold" size="sm" className="flex-1">
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Request Changes
                          </Button>
                        </div>
                      )}
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
    </div>
  );
};

export default ClientDashboard;
