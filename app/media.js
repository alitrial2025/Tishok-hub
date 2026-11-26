export function imagePath(file) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/${file}.webp`;
}
