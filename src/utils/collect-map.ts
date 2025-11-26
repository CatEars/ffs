export function collectMap<T>(iterator: MapIterator<T>): T[] {
    const elements: T[] = [];
    for (const x of iterator) {
        elements.push(x);
    }
    return elements;
}
