import amalfiImage from "@/assets/portfolio-amalfi.jpeg";
import amalfi1 from "@/assets/amalfi-1.webp";
import amalfi2 from "@/assets/amalfi-2.jpeg";
import amalfi3 from "@/assets/amalfi-3.jpeg";
import amalfi4 from "@/assets/amalfi-4.jpeg";
import amalfi5 from "@/assets/amalfi-5.jpeg";
import amalfi6 from "@/assets/amalfi-6.jpeg";
import amalfi8 from "@/assets/amalfi-8.jpeg";
import amalfi9 from "@/assets/amalfi-9.webp";
import amalfi10 from "@/assets/amalfi-10.webp";
import bristol1 from "@/assets/bristol-1.jpg";
import bristol2 from "@/assets/bristol-2.jpg";
import bristol3 from "@/assets/bristol-3.jpg";
import sorrentoCover from "@/assets/sorrento-cover.jpg";
import sorrento2 from "@/assets/sorrento-2.jpg";
import sorrento3 from "@/assets/sorrento-3.jpg";
import sorrento4 from "@/assets/sorrento-4.jpg";
import sorrento5 from "@/assets/sorrento-5.jpg";
import sorrento6 from "@/assets/sorrento-6.jpg";
import sorrento7 from "@/assets/sorrento-7.jpg";
import sorrento8 from "@/assets/sorrento-8.jpg";
import sorrento9 from "@/assets/sorrento-9.jpg";
import sealevelCover from "@/assets/sealevel-cover.jpg";
import sealevel2 from "@/assets/sealevel-2.jpg";
import sealevel3 from "@/assets/sealevel-3.jpg";
import lacumbreCover from "@/assets/lacumbre-cover.jpg";
import lacumbre2 from "@/assets/lacumbre-2.jpg";
import lacumbre3 from "@/assets/lacumbre-3.jpg";
import lacumbre4 from "@/assets/lacumbre-4.jpg";
import lacumbre5 from "@/assets/lacumbre-5.png";
import lacumbre6 from "@/assets/lacumbre-6.png";

export interface Project {
  id: string;
  image: string;
  title: string;
  category: string;
  location: string;
  objectPosition?: string;
  photos: string[];
  description: string;
}

export const projects: Project[] = [
  {
    id: "amalfi",
    image: amalfiImage,
    title: "Amalfi",
    category: "Residential",
    location: "Pacific Palisades",
    objectPosition: "15% center",
    photos: [amalfi1, amalfi2, amalfi3, amalfi4, amalfi5, amalfi6, amalfi8, amalfiImage, amalfi9, amalfi10],
    description: "Completed in 2021, this 8,500 sqft project kickstarted Navarre Interiors. With 6 bedrooms and 9 bathrooms...",
  },
  {
    id: "sorrento",
    image: sorrentoCover,
    title: "Sorrento",
    category: "Residential",
    location: "Pacific Palisades",
    photos: [sorrentoCover, sorrento2, sorrento3, sorrento4, sorrento6, sorrento7, sorrento8, sorrento5, sorrento9],
    description: "A stunning Pacific Palisades residence featuring bold design choices and seamless indoor-outdoor living.",
  },
  {
    id: "sea-level",
    image: sealevelCover,
    title: "Sea Level",
    category: "Residential",
    location: "Malibu",
    photos: [sealevelCover, sealevel2, sealevel3],
    description: "A beautiful Malibu residence with stunning ocean views and contemporary coastal design.",
  },
  {
    id: "bristol",
    image: bristol1,
    title: "Bristol",
    category: "Residential",
    location: "Brentwood",
    photos: [bristol1, bristol2, bristol3],
    description: "A beautifully renovated residence in Brentwood featuring timeless design elements and modern comforts.",
  },
  {
    id: "la-cumbre",
    image: lacumbreCover,
    title: "La Cumbre",
    category: "Residential",
    location: "Pacific Palisades",
    photos: [lacumbreCover, lacumbre2, lacumbre3, lacumbre4, lacumbre5, lacumbre6],
    description: "A charming Pacific Palisades home featuring a beautifully renovated kitchen and classic California style.",
  },
];
export const getProjectById = (id: string): Project | undefined => {
  return projects.find((project) => project.id === id);
};
