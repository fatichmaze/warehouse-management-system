export function buildInitialFormState(product) {
  return {
    sku: product?.sku ? String(product.sku) : "",
    name: product?.name ? String(product.name) : "",
    category_id:
      product?.category_id !== undefined && product?.category_id !== null
        ? String(product.category_id)
        : "",
    description: product?.description ? String(product.description) : "",
    purchase_price:
      product?.purchase_price !== undefined && product?.purchase_price !== null
        ? String(product.purchase_price)
        : "",
    selling_price:
      product?.selling_price !== undefined && product?.selling_price !== null
        ? String(product.selling_price)
        : "",
    min_stock:
      product?.min_stock !== undefined && product?.min_stock !== null
        ? String(product.min_stock)
        : "",
    low_stock:
      product?.low_stock !== undefined && product?.low_stock !== null
        ? String(product.low_stock)
        : "",
    current_stock:
      product?.current_stock !== undefined && product?.current_stock !== null
        ? String(product.current_stock)
        : "",
    unit: product?.unit ? String(product.unit) : "",
    rack_location: product?.rack_location ? String(product.rack_location) : "",
    image_url: product?.image_url ? String(product.image_url) : "",
  };
}

export function isValidHttpOrHttpsUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
