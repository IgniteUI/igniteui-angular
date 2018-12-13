/**
 * @hidden
 */
export function DeprecateMethod(message: string): MethodDecorator {
    return (constructor: any) => {
        console.warn(constructor.constructor.name + ': ' + message);
    };
}

/**
 * @hidden
 */
export function DeprecateProperty(message: string): PropertyDecorator {
    return (constructor: any) => {
        console.warn(constructor.constructor.name + ': ' + message);
    };
}
