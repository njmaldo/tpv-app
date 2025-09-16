
import { atom } from 'nanostores';
import type { BakeryItem } from '@/interfaces/BakeryItem';

// Interfaz para un producto en el carrito, extiende la interfaz BakeryItem
export interface CartItem extends BakeryItem {
  quantity: number;
}

// Creamos la tienda para el carrito
export const cart = atom<CartItem[]>([]);

// Agregamos funciones para interactuar con la tienda
export function addItemToCart(item: BakeryItem) {
  const currentCart = cart.get();
  const existingItem = currentCart.find((i) => i.id === item.id);

  if (existingItem) {
    // Si el producto ya está en el carrito, verifica el stock antes de aumentar la cantidad
    if (existingItem.quantity < item.stock) {
      // ✅ Solución: Creamos un nuevo objeto para forzar la actualización del estado
      const updatedItem = { ...existingItem, quantity: existingItem.quantity + 1 };
      
      const updatedCart = currentCart.map(i => i.id === updatedItem.id ? updatedItem : i);
      
      cart.set(updatedCart);
      
    } else {
      console.warn(`No hay más stock disponible para ${item.name}`);
    }
  } else {
    // Si es un producto nuevo, verifica si hay stock para agregar la primera unidad
    if (item.stock > 0) {
      cart.set([...currentCart, { ...item, quantity: 1 }]);
    } else {
      console.warn(`${item.name} está agotado.`);
    }
  }
}

export function removeItemFromCart(itemId: string) {
  const currentCart = cart.get();
  cart.set(currentCart.filter((i) => i.id !== itemId));
}

export function clearCart() {
  cart.set([]);
}

export function updateItemQuantity(itemId: string, newQuantity: number) {
  const currentCart = cart.get();
  const updatedCart = currentCart.map((item) =>
    item.id === itemId ? { ...item, quantity: newQuantity } : item
  );
  cart.set(updatedCart);
}