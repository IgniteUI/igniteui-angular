import { SimpleChanges, SimpleChange } from '@angular/core';

/**
* @hidden
*/
export function WatchChanges(): PropertyDecorator {
    return (target: any, key: string, propDesc?: PropertyDescriptor) => {
        const privateKey = '_' + key.toString();
        propDesc = propDesc || {
            configurable: true,
            enumerable: true,
        };
        propDesc.get = propDesc.get || (function (this: any) { return this[privateKey]; });
        const originalSetter = propDesc.set || (function (this: any, val: any) { this[privateKey] = val; });

        propDesc.set = function (this: any, val: any) {
            const oldValue = this[key];
            if (val !== oldValue || (typeof val === 'object' && val === oldValue)) {
                originalSetter.call(this, val);
                if (this.ngOnChanges) {
                    // in case wacthed prop changes trigger ngOnChanges manually
                    const changes: SimpleChanges = {
                        [key]: new SimpleChange(oldValue, val, false)
                    };
                    this.ngOnChanges(changes);
               }
            }
        };
        return propDesc;
    };
}
