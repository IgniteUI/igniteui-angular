import { IgxCsvExporterOptions, IgxCsvExporterService } from 'igniteui-angular';
import { IgcNgElement } from '../app/custom-strategy';

export class IgcCsvExporterService extends IgxCsvExporterService {
    public override export(grid: any, options: IgxCsvExporterOptions): void {
        const elementGrid = grid as IgcNgElement;
        const gridRef = (elementGrid.ngElementStrategy as any)?.componentRef?.instance;
        super.export(gridRef, options);
    }
}
