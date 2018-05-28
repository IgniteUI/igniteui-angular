export function DeprecateClass(message) {
    return function (constructor) {
        console.warn(constructor.name + ": " + message);
    };
}
export function DeprecateMethod(message) {
    return function (constructor) {
        console.warn(constructor.constructor.name + ": " + message);
    };
}
export function DeprecateProperty(message) {
    return function (constructor) {
        console.warn(constructor.constructor.name + ": " + message);
    };
}
