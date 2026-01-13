/**
 * Executes a loop in chunks to avoid blocking the UI thread.
 * Uses setTimeout(0) for macrotask scheduling between chunks.
 * @hidden
 * @internal
 */
export const yieldingLoop = (count: number, chunkSize: number, callback: (index: number) => void, done: () => void) => {
    let i = 0;
    const chunk = () => {
        const end = Math.min(i + chunkSize, count);
        for (; i < end; ++i) {
            callback(i);
        }
        if (i < count) {
            setTimeout(chunk, 0);
        } else {
            done();
        }
    };
    chunk();
};
