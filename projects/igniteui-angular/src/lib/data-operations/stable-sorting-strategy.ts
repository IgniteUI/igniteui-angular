import { SortingStrategy } from './sorting-strategy';

/**
 * @hidden
 */
export class StableSortingStrategy extends SortingStrategy {
    protected compareObjects(obj1: any, obj2: any): number {
        const res = super.compareObjects.apply(this, arguments);
        const replacerFn = (key, val) => {
            if (val === undefined) {
                return null;
            }
            return val;
        };
        if (!res) {
            return JSON.stringify(obj1, replacerFn)
                        .localeCompare(JSON.stringify(obj2, replacerFn));
        }
        return res;
    }
}
