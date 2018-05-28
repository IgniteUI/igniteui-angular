/** Symbol.observable addition */
declare global  {
    interface SymbolConstructor {
        observable: symbol;
    }
}
/** Symbol.observable or a string "@@observable". Used for interop */
export declare const observable: string | symbol;
