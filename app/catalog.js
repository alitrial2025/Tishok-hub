export const sizes = ["S", "M", "L", "XL"];

export const products = [
  { id: "orange", name: "Signal Orange", title: "Signal Hoodie", image: 0, file: "orange-back", color: "#f34d20", description: "Burnt orange / Coal", price: 128, sizes },
  { id: "coal", name: "Washed Coal", title: "Signal Hoodie", image: 3, file: "coal-back", color: "#222220", description: "Washed black / Bone", price: 128, sizes },
  { id: "concrete", name: "Concrete", title: "Signal Hoodie", image: 4, file: "concrete-back", color: "#a89c82", description: "Warm sand / Coal", price: 128, sizes },
  { id: "cargo", name: "Slate", title: "Field Cargo", file: "field-cargo", description: "Slate cotton twill", price: 112, sizes },
  { id: "cap", name: "Black", title: "Slash Cap", file: "slash-cap", description: "Washed black cotton", price: 38, sizes: ["One size"] },
];

export const hoodies = products.slice(0, 3);
export const campaigns = ["campaign", "campaign-coal", "campaign-concrete"];
export const variantKey = (product, size) => `${product.id}-${size === "One size" ? "OS" : size}`;
export const validItem = item => Number.isInteger(item?.product) && products[item.product]?.sizes.includes(item.size)
  && Number.isSafeInteger(item.quantity) && item.quantity > 0;

export function studioPath(index, view = "inspect") {
  return `/studio/${hoodies[index].id}${view === "fit" ? "#fit-guide" : ""}`;
}
