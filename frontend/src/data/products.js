// Product catalog — add new products by adding an object here + dropping a .glb in public/models/
const products = [
  {
    id: 1,
    name: "The Cloud Lounger",
    price: 1299,
    modelSrc: "/models/sofa.glb",
    iosSrc: null,
    category: "seating",
    badge: "Best Seller",
    description: "A sofa so soft you'll forget gravity exists. Inspired by cumulus clouds, designed for endless naps.",
    variants: [
      { name: "Cotton White", color: "#f5f0e1" },
      { name: "Sunset Blush", color: "#f4a6b0" },
      { name: "Storm Grey", color: "#6b7b8d" },
    ],
  },
  {
    id: 2,
    name: "Jellyfish Glow Lamp",
    price: 189,
    modelSrc: "/models/lamp.glb",
    iosSrc: null,
    category: "lighting",
    badge: "New",
    description: "Bioluminescent-inspired table lamp that pulses with soft color. Like having a tiny ocean on your desk.",
    variants: [
      { name: "Deep Sea", color: "#1a3a5c" },
      { name: "Coral Reef", color: "#ff7f7f" },
      { name: "Biolume", color: "#7fffd4" },
    ],
  },
  {
    id: 3,
    name: "The Hug Chair",
    price: 749,
    modelSrc: "/models/armchair.glb",
    iosSrc: null,
    category: "seating",
    badge: "Popular",
    description: "An armchair that wraps around you like a warm embrace. Curved cocoon design with memory foam core.",
    variants: [
      { name: "Lavender Dream", color: "#b794f4" },
      { name: "Moss Garden", color: "#6dd4a1" },
      { name: "Terracotta", color: "#c67a4b" },
    ],
  },
  {
    id: 4,
    name: "Mushroom Side Table",
    price: 420,
    modelSrc: "/models/table.glb",
    iosSrc: null,
    category: "tables",
    badge: "Unique",
    description: "A whimsical side table inspired by forest fungi. Solid wood cap with a sculptural tapered stem.",
    variants: [
      { name: "Forest Oak", color: "#c8a96e" },
      { name: "Midnight", color: "#2d2d3d" },
      { name: "Blush Pink", color: "#f0b8c8" },
    ],
  },
];

export default products;
