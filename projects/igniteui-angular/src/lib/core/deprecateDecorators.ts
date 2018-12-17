import { isDevMode } from '@angular/core';

/**
 * @hidden
 */
export function DeprecateMethod(message: string): MethodDecorator {
    let isMessageShown = false;

    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        if (descriptor && descriptor.value) {
            const originalMethod = descriptor.value;

            descriptor.value = function () {
                if (!isMessageShown && isDevMode()) {
                    const targetName = typeof target === 'function' ? target.name : target.constructor.name;
                    isMessageShown = true;

                    console.warn(`${targetName}.${key}: ${message}`);
                }

                return originalMethod.apply(this, arguments);
            };

            return descriptor;
        }
    };
}

/**
 * @hidden
 */
export function DeprecateProperty(message: string): PropertyDecorator {
    return function(target: any, key: string) {
        let isMessageShown = false;

        // use backing field to set/get the value of the property to ensure there won't be infinite recursive calls
        const newKey = generateUniqueKey(target, key);

        Object.defineProperty(target, key, {
            set(value) {
                this[newKey] = value;
            },
            get() {
                if (!isMessageShown && isDevMode()) {
                    isMessageShown = true;
                    console.warn(`${target.constructor.name}.${key}: ${message}`);
                }

                return this[newKey];
            }
        });
    };
}

/**
 * @hidden
 */
function generateUniqueKey(target: any, key: string): string {
    let newKey = '_' + key;
    while (target.hasOwnProperty(newKey)) {
        newKey = '_' + newKey;
    }

    return newKey;
}
