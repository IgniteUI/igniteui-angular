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
                const targetName = typeof target === 'function' ? target.name : target.constructor.name;
                isMessageShown = showMessage(`${targetName}.${key}: ${message}`, isMessageShown);

                return originalMethod.call(this, arguments);
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

        let getter, setter;
        const orignalDescriptor = Object.getOwnPropertyDescriptor(target, key);
        if (orignalDescriptor) {
            getter = orignalDescriptor.get;
            setter = orignalDescriptor.set;

            delete target[key];
        }

        return Object.defineProperty(target, key, {
            set(value) {
                isMessageShown = showMessage(`${target.constructor.name}.${key}: ${message}`, isMessageShown);

                if (setter) {
                    setter.call(this, value);
                } else {
                    this[newKey] = value;
                }
            },
            get() {
                isMessageShown = showMessage(`${target.constructor.name}.${key}: ${message}`, isMessageShown);

                if (getter) {
                    return getter.call(this);
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

/**
 * @hidden
 */
function showMessage(message: string, isMessageShown: boolean): boolean {
    if (!isMessageShown && isDevMode()) {
        console.warn(message);
    }

    return true;
}
