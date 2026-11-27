import { notFound } from "next/navigation";
import { hoodies } from "../../catalog";
import Studio from "../studio";

export const dynamicParams = false;

export function generateStaticParams() {
  return hoodies.map(item => ({ color: item.id }));
}

export async function generateMetadata({ params }) {
  const { color } = await params;
  const item = hoodies.find(entry => entry.id === color);
  if (!item) notFound();

  return {
    title: `${item.name} Signal Hoodie — Tishok Hub`,
    description: `Explore the ${item.name} Signal Hoodie, its fit and fabric, in the Tishok Hub Garment Studio.`,
  };
}

export default async function StudioPage({ params }) {
  const { color } = await params;
  const index = hoodies.findIndex(item => item.id === color);
  if (index === -1) notFound();

  return <Studio key={color} index={index} />;
}
