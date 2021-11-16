import { GridType } from '../common/grid.interface';

/** @hidden @internal */
export abstract class IgxToolbarToken {

    abstract grid: GridType;
    abstract showProgress: boolean;
}
