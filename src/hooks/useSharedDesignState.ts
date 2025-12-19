import { useState, useEffect, useCallback } from "react";

// Types
interface Comment {
  id: number;
  sender: string;
  name?: string;
  text: string;
  time: string;
}

interface DesignItem {
  id: number;
  type: string;
  name: string;
  image: string;
  status: string;
  link?: string;
  commentsList: Comment[];
}

interface Inspiration {
  id: number;
  title: string;
  coverImage: string;
  notes: string;
  gallery: string[];
  designItems: DesignItem[];
}

interface Rendering {
  id: number;
  title: string;
  image: string;
  status: string;
  sent?: boolean;
  commentsList: Comment[];
}

interface Document {
  id: number;
  name: string;
  size: string;
  type: string;
  date: string;
  data?: string;
  status: "draft" | "sent" | "archived";
}

const STORAGE_KEYS = {
  INSPIRATIONS: "shared_inspirations",
  RENDERINGS: "shared_renderings",
  DOCUMENTS: "shared_documents",
};

// Default data
const defaultInspirations: Inspiration[] = [
  { 
    id: 1, 
    title: "Living Room Mood", 
    coverImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400", 
    notes: "Warm neutrals with brass accents",
    gallery: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
    ],
    designItems: [
      { id: 1, type: "Paint Color", name: "Benjamin Moore - Simply White", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200", status: "approved", link: "https://www.benjaminmoore.com/en-us/paint-colors/color/oc-117/simply-white", commentsList: [] },
      { id: 2, type: "Sofa", name: "Article Sven Charme Tan", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200", status: "pending", link: "https://www.article.com/product/1024/sven-charme-tan-sofa", commentsList: [] },
      { id: 3, type: "Coffee Table", name: "West Elm Streamline Round", image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=200", status: "pending", link: "https://www.westelm.com/products/streamline-coffee-table", commentsList: [] },
    ]
  },
  { 
    id: 2, 
    title: "Kitchen Concept", 
    coverImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400", 
    notes: "Modern minimalist with marble",
    gallery: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
      "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800",
      "https://images.unsplash.com/photo-1556909190-4e67f6e0a9e5?w=800",
    ],
    designItems: [
      { id: 1, type: "Countertop", name: "Calacatta Gold Marble", image: "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=200", status: "approved", link: "https://www.msisurfaces.com/natural-stone-quartz/calacatta-gold", commentsList: [] },
      { id: 2, type: "Faucet", name: "Kohler Purist in Brushed Nickel", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200", status: "pending", link: "https://www.kohler.com/en/products/kitchen-faucets/purist", commentsList: [] },
    ]
  },
  { 
    id: 3, 
    title: "Bedroom Vision", 
    coverImage: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400", 
    notes: "Serene and organic textures",
    gallery: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
    ],
    designItems: [
      { id: 1, type: "Bedding", name: "Parachute Linen Duvet - Bone", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200", status: "pending", link: "https://www.parachutehome.com/products/linen-duvet-cover", commentsList: [] },
      { id: 2, type: "Nightstand", name: "CB2 Gwyneth Side Table", image: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=200", status: "pending", link: "https://www.cb2.com/gwyneth-nightstand", commentsList: [] },
    ]
  },
];

const defaultRenderings: Rendering[] = [
  { 
    id: 1, 
    title: "Living Room - Option A", 
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600", 
    status: "approved", 
    sent: true,
    commentsList: [
      { id: 1, sender: "designer", name: "Sarah Mitchell", text: "Here's the first option for your living room!", time: "Dec 10, 2:30 PM" },
      { id: 2, sender: "client", text: "Love the layout! Can we try a warmer color palette?", time: "Dec 10, 4:15 PM" },
      { id: 3, sender: "designer", name: "Sarah Mitchell", text: "Absolutely! I'll work on that revision.", time: "Dec 11, 9:00 AM" },
    ]
  },
  { 
    id: 2, 
    title: "Kitchen Rendering", 
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600", 
    status: "pending", 
    sent: true,
    commentsList: [
      { id: 1, sender: "designer", name: "Sarah Mitchell", text: "Kitchen concept with marble counters as discussed.", time: "Dec 14, 11:00 AM" },
    ]
  },
  { 
    id: 3, 
    title: "Master Bedroom", 
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600", 
    status: "revision", 
    sent: true,
    commentsList: [
      { id: 1, sender: "designer", name: "Sarah Mitchell", text: "Master bedroom with organic textures.", time: "Dec 12, 3:00 PM" },
      { id: 2, sender: "client", text: "The bed position feels off. Can we try centering it?", time: "Dec 12, 5:30 PM" },
      { id: 3, sender: "designer", name: "Sarah Mitchell", text: "Good point! Will adjust.", time: "Dec 12, 6:00 PM" },
      { id: 4, sender: "client", text: "Also prefer lighter curtains", time: "Dec 13, 10:00 AM" },
      { id: 5, sender: "designer", name: "Sarah Mitchell", text: "Noted! Working on the revision now.", time: "Dec 13, 11:00 AM" },
    ]
  },
  { 
    id: 4, 
    title: "Guest Bathroom", 
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600", 
    status: "draft", 
    sent: false,
    commentsList: []
  },
];

const defaultDocuments: Document[] = [
  { id: 1, name: "Design Concept v2.pdf", type: "PDF", date: "Dec 15, 2024", size: "2.4 MB", status: "sent" },
  { id: 2, name: "Floor Plan Final.pdf", type: "PDF", date: "Dec 10, 2024", size: "1.8 MB", status: "sent" },
  { id: 3, name: "Material Selections.pdf", type: "PDF", date: "Dec 5, 2024", size: "3.2 MB", status: "archived" },
  { id: 4, name: "Budget Draft.xlsx", type: "XLSX", date: "Dec 18, 2024", size: "156 KB", status: "draft" },
];

// Custom event for cross-tab communication
const SYNC_EVENT = "designStateSync";

export const useSharedInspirations = () => {
  const [inspirations, setInspirationsState] = useState<Inspiration[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.INSPIRATIONS);
    return stored ? JSON.parse(stored) : defaultInspirations;
  });

  // Listen for changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.INSPIRATIONS && e.newValue) {
        setInspirationsState(JSON.parse(e.newValue));
      }
    };

    const handleSyncEvent = () => {
      const stored = localStorage.getItem(STORAGE_KEYS.INSPIRATIONS);
      if (stored) {
        setInspirationsState(JSON.parse(stored));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(SYNC_EVENT, handleSyncEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(SYNC_EVENT, handleSyncEvent);
    };
  }, []);

  const setInspirations = useCallback((newData: Inspiration[] | ((prev: Inspiration[]) => Inspiration[])) => {
    setInspirationsState((prev) => {
      const updated = typeof newData === "function" ? newData(prev) : newData;
      localStorage.setItem(STORAGE_KEYS.INSPIRATIONS, JSON.stringify(updated));
      window.dispatchEvent(new Event(SYNC_EVENT));
      return updated;
    });
  }, []);

  return [inspirations, setInspirations] as const;
};

export const useSharedRenderings = () => {
  const [renderings, setRenderingsState] = useState<Rendering[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.RENDERINGS);
    return stored ? JSON.parse(stored) : defaultRenderings;
  });

  // Listen for changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.RENDERINGS && e.newValue) {
        setRenderingsState(JSON.parse(e.newValue));
      }
    };

    const handleSyncEvent = () => {
      const stored = localStorage.getItem(STORAGE_KEYS.RENDERINGS);
      if (stored) {
        setRenderingsState(JSON.parse(stored));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(SYNC_EVENT, handleSyncEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(SYNC_EVENT, handleSyncEvent);
    };
  }, []);

  const setRenderings = useCallback((newData: Rendering[] | ((prev: Rendering[]) => Rendering[])) => {
    setRenderingsState((prev) => {
      const updated = typeof newData === "function" ? newData(prev) : newData;
      localStorage.setItem(STORAGE_KEYS.RENDERINGS, JSON.stringify(updated));
      window.dispatchEvent(new Event(SYNC_EVENT));
      return updated;
    });
  }, []);

  return [renderings, setRenderings] as const;
};

export const useSharedDocuments = () => {
  const [documents, setDocumentsState] = useState<Document[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return stored ? JSON.parse(stored) : defaultDocuments;
  });

  // Listen for changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.DOCUMENTS && e.newValue) {
        setDocumentsState(JSON.parse(e.newValue));
      }
    };

    const handleSyncEvent = () => {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (stored) {
        setDocumentsState(JSON.parse(stored));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(SYNC_EVENT, handleSyncEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(SYNC_EVENT, handleSyncEvent);
    };
  }, []);

  const setDocuments = useCallback((newData: Document[] | ((prev: Document[]) => Document[])) => {
    setDocumentsState((prev) => {
      const updated = typeof newData === "function" ? newData(prev) : newData;
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated));
      window.dispatchEvent(new Event(SYNC_EVENT));
      return updated;
    });
  }, []);

  return [documents, setDocuments] as const;
};
