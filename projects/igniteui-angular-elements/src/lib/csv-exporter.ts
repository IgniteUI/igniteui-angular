import { GridTypeBase, IgxCsvExporterOptions, IgxCsvExporterService } from 'igniteui-angular';

export class IgcCsvExporterService extends IgxCsvExporterService {
    public override export(grid: GridTypeBase, options: IgxCsvExporterOptions): void {
        const gridRef = (grid as any).ngElementStrategy?.componentRef?.instance;
        super.export(gridRef || grid, options);
    }
}
