export async function collectAsync<T>(iterable: AsyncIterable<T>): Promise<T[]> {
    const elems: T[] = [];
    for await (const element of iterable) {
        elems.push(element);
    }
    return elems;
}
