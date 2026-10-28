import { Component, signal } from '@angular/core';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface PracticeItem {
  id: number;
  name: string;
  price: number;
  stock: number;
}

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // 1. @if / @else if / @else state
  readonly score = signal<number>(85);

  // 2. @switch / @case / @default state
  readonly status = signal<OrderStatus>('pending');
  readonly statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  // 3. @for / @empty & @let state
  readonly taxRate = signal<number>(0.15);
  readonly products = signal<PracticeItem[]>([
    { id: 101, name: 'Mechanical Keyboard', price: 120, stock: 10 },
    { id: 102, name: 'Gaming Mouse', price: 60, stock: 3 },
    { id: 103, name: '27" 4K Monitor', price: 350, stock: 0 },
    { id: 104, name: 'USB-C Hub', price: 40, stock: 15 },
  ]);

  // 4. @defer trigger state
  readonly loadDeferred = signal<boolean>(false);

  setScore(val: number): void {
    this.score.set(val);
  }

  setStatus(newStatus: OrderStatus): void {
    this.status.set(newStatus);
  }

  removeProduct(id: number): void {
    this.products.update((prev) => prev.filter((item) => item.id !== id));
  }

  clearProducts(): void {
    this.products.set([]);
  }

  resetProducts(): void {
    this.products.set([
      { id: 101, name: 'Mechanical Keyboard', price: 120, stock: 10 },
      { id: 102, name: 'Gaming Mouse', price: 60, stock: 3 },
      { id: 103, name: '27" 4K Monitor', price: 350, stock: 0 },
      { id: 104, name: 'USB-C Hub', price: 40, stock: 15 },
    ]);
  }
}
