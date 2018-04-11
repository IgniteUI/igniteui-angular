export function DeprecateClass(message: string): ClassDecorator {
    return function (constructor: any) {
        console.warn(constructor.name + ": " + message);
    }
}

export function DeprecateMethod(message: string): MethodDecorator {
    return function (constructor: any) {
        console.warn(constructor.constructor.name + ": " + message);
    }
}

export function DeprecateProperty(message: string): PropertyDecorator {
    return function (constructor: any) {
        console.warn(constructor.constructor.name + ": " + message);
    }
}
