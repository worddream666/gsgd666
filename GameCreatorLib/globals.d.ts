// Fix for TypeScript 4.9 compatibility
// Provides the AsyncIterableIterator type needed by some JS files
interface AsyncIterableIterator<T> {
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
    next(...args: [] | [T]): Promise<IteratorResult<T>>;
    return?(value?: T): Promise<IteratorResult<T>>;
    throw?(e?: any): Promise<IteratorResult<T>>;
}
