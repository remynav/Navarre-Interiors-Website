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
import bedroomImage from "@/assets/portfolio-bedroom.jpg";
import kitchenImage from "@/assets/portfolio-kitchen.jpg";

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
    id: "serene-retreat",
    image: bedroomImage,
    title: "Serene Retreat",
    category: "Bedroom",
    location: "Brooklyn, NY",
    photos: [bedroomImage],
    description: "A tranquil bedroom sanctuary designed to promote rest and relaxation. This project emphasizes soft textures, calming color palettes, and thoughtful lighting to create the ultimate retreat.",
  },
  {
    id: "chefs-kitchen",
    image: kitchenImage,
    title: "Chef's Kitchen",
    category: "Kitchen",
    location: "The Hamptons",
    photos: [kitchenImage],
    description: "A professional-grade kitchen designed for the home chef. This space combines high-end appliances with elegant finishes, creating a culinary workspace that's as beautiful as it is functional.",
  },
];

export const getProjectById = (id: string): Project | undefined => {
  return projects.find((project) => project.id === id);
};
