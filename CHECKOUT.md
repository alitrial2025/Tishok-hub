# OFF/FORM checkout

The storefront uses Shopify Storefront Cart API for stock checks and hosted checkout. Set these variables in the server runtime or `.env.local` for development.

- `SHOPIFY_STORE_DOMAIN` is the store's `your-store.myshopify.com` hostname.
- `SHOPIFY_STOREFRONT_TOKEN` is a Storefront API access token with product listings, product inventory, and checkout access. Keep it on the server.
- `SHOPIFY_VARIANTS` is a JSON object mapping the keys below to Shopify ProductVariant GIDs. Example mapping shape: `{"orange-M":"gid://shopify/ProductVariant/123456789"}`.

| Item | Variant keys |
| --- | --- |
| Signal Orange hoodie | `orange-S`, `orange-M`, `orange-L`, `orange-XL` |
| Washed Coal hoodie | `coal-S`, `coal-M`, `coal-L`, `coal-XL` |
| Concrete hoodie | `concrete-S`, `concrete-M`, `concrete-L`, `concrete-XL` |
| Field Cargo | `cargo-S`, `cargo-M`, `cargo-L`, `cargo-XL` |
| Slash Cap | `cap-OS` |

For restricted cloud egress, allow the exact Shopify store hostname in environment settings. Publish the mapped products to the Storefront token's sales channel, confirm USD prices against `app/catalog.js`, and set inventory, shipping, payment, and return policies in Shopify. Verify the reference sizing in `app/field-notes.js` against production garments. Test an in-stock and an out-of-stock variant and complete a Shopify test order before enabling live sales.
