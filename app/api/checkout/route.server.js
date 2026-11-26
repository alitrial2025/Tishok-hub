import { products, validItem, variantKey } from "../../catalog.js";

const reply = (value, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request) {
  const { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_TOKEN, SHOPIFY_VARIANTS } = process.env;
  const domain = SHOPIFY_STORE_DOMAIN?.toLowerCase();
  if (!domain || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain) || !SHOPIFY_STOREFRONT_TOKEN || !SHOPIFY_VARIANTS) {
    return reply({ error: "Online checkout is opening soon. Your bag is saved." }, 503);
  }

  const payload = await request.json().catch(() => null);
  if (!Array.isArray(payload?.items) || !payload.items.length || payload.items.length > 17 || !payload.items.every(validItem)) {
    return reply({ error: "Your bag contains an invalid item." }, 400);
  }

  try {
    const shopVariants = JSON.parse(SHOPIFY_VARIANTS);
    const grouped = new Map();
    for (const item of payload.items) {
      const product = products[item.product];
      const id = shopVariants[variantKey(product, item.size)];
      if (typeof id !== "string" || !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(id)) {
        return reply({ error: `${product.title} in ${product.name} / ${item.size} is not listed for online checkout yet.` }, 409);
      }
      grouped.set(id, (grouped.get(id) || 0) + item.quantity);
    }
    const lines = Array.from(grouped, ([merchandiseId, quantity]) => ({ merchandiseId, quantity }));
    if (lines.some(line => line.quantity > 20)) return reply({ error: "Checkout supports up to 20 units per item." }, 400);

    async function storefront(query, variables) {
      const response = await fetch(`https://${domain}/api/2026-10/graphql.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN },
        body: JSON.stringify({ query, variables }),
        cache: "no-store",
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(8000)]),
      });
      if (!response.ok) throw new Error("Storefront request failed");
      const result = await response.json();
      if (result.errors || !result.data) throw new Error("Storefront response failed");
      return result.data;
    }

    const { nodes } = await storefront(
      "query Stock($ids: [ID!]!) { nodes(ids: $ids) { ... on ProductVariant { id availableForSale quantityAvailable product { title } title } } }",
      { ids: lines.map(line => line.merchandiseId) },
    );
    const unavailable = lines.find((line, index) => !nodes[index]?.availableForSale
      || (Number.isInteger(nodes[index]?.quantityAvailable) && nodes[index].quantityAvailable < line.quantity));
    if (unavailable) {
      const variant = nodes[lines.indexOf(unavailable)];
      return reply({ error: variant ? `${variant.product.title} / ${variant.title} is unavailable in that quantity.` : "A selected size or color is no longer available." }, 409);
    }

    const { cartCreate } = await storefront(
      "mutation Checkout($input: CartInput!) { cartCreate(input: $input) { cart { checkoutUrl lines(first: 20) { nodes { quantity merchandise { ... on ProductVariant { id } } } } } userErrors { message } } }",
      { input: { lines } },
    );
    if (cartCreate.userErrors.length || !cartCreate.cart) return reply({ error: "The store could not honor this bag. Check quantities and try again." }, 409);
    const cartLines = cartCreate.cart.lines.nodes;
    if (lines.length !== cartLines.length || lines.some(line => !cartLines.some(entry => entry.merchandise.id === line.merchandiseId && entry.quantity === line.quantity))) {
      return reply({ error: "Stock changed while opening checkout. Check quantities and try again." }, 409);
    }
    const checkout = new URL(cartCreate.cart.checkoutUrl);
    if (checkout.protocol !== "https:" || checkout.username || checkout.password) throw new Error("Invalid checkout URL");
    return reply({ url: checkout.href });
  } catch {
    return reply({ error: "Checkout couldn’t connect to the store. Your bag is saved. Try again shortly." }, 502);
  }
}
