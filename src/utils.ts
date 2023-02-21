export function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function localeCompare(a: string, b: string): number {
  return a.localeCompare(b);
}

export function unique<T>(iterable: T[]): T[] {
  return [...new Set(iterable)];
}
