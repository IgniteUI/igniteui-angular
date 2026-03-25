import { GridTypeBase, IgxExcelExporterOptions, IgxExcelExporterService } from 'igniteui-angular';

export class IgcExcelExporterService extends IgxExcelExporterService {
    public override export(grid: GridTypeBase, options: IgxExcelExporterOptions): void {
        const gridRef = (grid as any).ngElementStrategy?.componentRef?.instance;
        super.export(gridRef, options);
    }
}
