export function getProductIcon(productName: string): string {
  const name = productName.toLowerCase();

  if (name.includes('disjoncteur')) {
    return '/products/breaker.svg';
  }
  if (name.includes('cable')) {
    return '/products/cable.svg';
  }
  if (name.includes('ampoule') || name.includes('spot')) {
    return '/products/bulb.svg';
  }
  if (name.includes('boitier')) {
    return '/products/box.svg';
  }
  if (name.includes('interrupteur')) {
    return '/products/switch.svg';
  }
  return '/products/generic.svg';
}
