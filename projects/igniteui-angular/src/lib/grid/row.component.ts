import { IgxRowBaseComponent, IgxGridComponent } from './index';

export class IgxGridRowComponent extends IgxRowBaseComponent<IgxGridComponent> {
    public get indentation() {
        return this.grid.groupingExpressions.length;
    }
}
