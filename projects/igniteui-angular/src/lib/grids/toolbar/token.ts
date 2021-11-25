import { GridType } from '../common/grid.interface';

/** @hidden @internal */
export abstract class IgxToolbarToken {

    public abstract grid: GridType;
    public abstract showProgress: boolean;
}
