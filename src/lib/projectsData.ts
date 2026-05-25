import amalfiImage from "@/assets/portfolio-amalfi.webp";
import amalfi1 from "@/assets/amalfi-1.webp";
import amalfi2 from "@/assets/amalfi-2.webp";
import amalfi3 from "@/assets/amalfi-3.webp";
import amalfi4 from "@/assets/amalfi-4.webp";
import amalfi5 from "@/assets/amalfi-5.webp";
import amalfi6 from "@/assets/amalfi-6.webp";
import amalfi8 from "@/assets/amalfi-8.webp";
import amalfi9 from "@/assets/amalfi-9.webp";
import amalfi10 from "@/assets/amalfi-10.webp";
import bristol1 from "@/assets/bristol-1.webp";
import bristol2 from "@/assets/bristol-2.webp";
import bristol3 from "@/assets/bristol-3.webp";
import sorrentoCover from "@/assets/sorrento-cover.webp";
import sorrento2 from "@/assets/sorrento-2.webp";
import sorrento3 from "@/assets/sorrento-3.webp";
import sorrento4 from "@/assets/sorrento-4.webp";
import sorrento5 from "@/assets/sorrento-5.webp";
import sorrento6 from "@/assets/sorrento-6.webp";
import sorrento7 from "@/assets/sorrento-7.webp";
import sorrento8 from "@/assets/sorrento-8.webp";
import sorrento9 from "@/assets/sorrento-9.webp";
import sealevelCover from "@/assets/sealevel-cover.webp";
import sealevel2 from "@/assets/sealevel-2.webp";
import sealevel3 from "@/assets/sealevel-3.webp";
import lacumbreCover from "@/assets/lacumbre-cover.webp";
import lacumbre2 from "@/assets/lacumbre-2.webp";
import lacumbre3 from "@/assets/lacumbre-3.webp";
import lacumbre4 from "@/assets/lacumbre-4.webp";
import lacumbre5 from "@/assets/lacumbre-5.webp";
import lacumbre6 from "@/assets/lacumbre-6.webp";

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
