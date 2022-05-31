export interface IValueResolveStrategy {
    resolveValue(obj: any, path: string): any;
}

export class NoopNestedPropertyStrategy implements IValueResolveStrategy {
    private static _instance: NoopNestedPropertyStrategy = null;

    private constructor() {  }

    public static instance() {
        return this._instance || (this._instance = new NoopNestedPropertyStrategy());
    }

    public resolveValue(obj: any, path: string): any {
        return obj[path];
    }
}

export class NestedPropertyStrategy implements IValueResolveStrategy {
    private static _instance: NestedPropertyStrategy = null;

    public constructor() {  }

    public static instance() {
        return this._instance || (this._instance = new NestedPropertyStrategy());
    }

    /**
     *
     * Given a property access path in the format `x.y.z` resolves and returns
     * the value of the `z` property in the passed object.
     *
     * @hidden
     * @internal
     */
    public resolveValue(obj: any, path: string) {
        const parts = path?.split('.') ?? [];
        let current = obj[parts.shift()];

        parts.forEach(prop => {
            if (current) {
                current = current[prop];
            }
        });

        return current;
    };
}
