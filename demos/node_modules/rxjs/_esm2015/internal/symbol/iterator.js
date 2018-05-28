export function getSymbolIterator() {
    if (typeof Symbol !== 'function' || !Symbol.iterator) {
        return '@@iterator';
    }
    return Symbol.iterator;
}
export const iterator = getSymbolIterator();
/**
 * @deprecated use {@link iterator} instead
 */
export const $$iterator = iterator;
//# sourceMappingURL=iterator.js.map