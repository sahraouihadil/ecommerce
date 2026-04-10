// Product catalog — add new products by adding an object here + dropping a .glb in public/models/
const products = [
  {
    id: 1,
    name: "Modern Sofa",
    price: 899,
    modelSrc: "/models/sofa.glb",
    iosSrc: null,
    category: "furniture",
    description: "Elegant 3-seater sofa with premium upholstery.",
    variants: [
      { name: "Charcoal", color: "#333333" },
      { name: "Navy", color: "#1a3a5c" },
      { name: "Cream", color: "#f5f0e1" },
    ],
  },
  {
    id: 2,
    name: "Table Lamp",
    price: 120,
    modelSrc: "/models/lamp.glb",
    iosSrc: null,
    category: "lighting",
    description: "Minimalist LED lamp with adjustable brightness.",
    variants: [
      { name: "Black", color: "#1a1a1a" },
      { name: "White", color: "#f0f0f0" },
    ],
  },
  {
    id: 3,
    name: "Armchair",
    price: 450,
    modelSrc: "/models/armchair.glb",
    iosSrc: null,
    category: "furniture",
    description: "Comfortable accent armchair with wooden legs.",
    variants: [
      { name: "Forest", color: "#2d5a27" },
      { name: "Mustard", color: "#d4a017" },
      { name: "Burgundy", color: "#722f37" },
    ],
  },
  {
    id: 4,
    name: "Coffee Table",
    price: 350,
    modelSrc: "/models/table.glb",
    iosSrc: null,
    category: "furniture",
    description: "Sleek wooden table with Scandinavian design.",
    variants: [
      { name: "Oak", color: "#c8a96e" },
      { name: "Walnut", color: "#5c4033" },
    ],
  },
];

export default products;
