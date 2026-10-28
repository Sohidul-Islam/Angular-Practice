import { Injectable, computed, signal } from '@angular/core';

export interface CartItem {
  id: number;
  name: string;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // ১. শেয়ার্ড স্টেট (Signal)
  readonly items = signal<CartItem[]>([]);

  // ২. ডেরাইভড/কম্পিউটেড স্টেট
  readonly totalCount = computed(() => this.items().length);
  readonly totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + item.price, 0)
  );

  // ৩. মেথড / একশনস
  addItem(item: CartItem): void {
    this.items.update((prev) => [...prev, item]);
  }

  removeItem(id: number): void {
    this.items.update((prev) => prev.filter((item) => item.id !== id));
  }

  clearCart(): void {
    this.items.set([]);
  }
}
