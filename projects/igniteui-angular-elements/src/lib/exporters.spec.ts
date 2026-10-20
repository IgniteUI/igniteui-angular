import { IgxCsvExporterOptions, IgxCsvExporterService, IgxExcelExporterOptions, IgxExcelExporterService, CsvFileTypes } from 'igniteui-angular';
import { IgcCsvExporterService } from './csv-exporter';
import { IgcExcelExporterService } from './excel-exporter';
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('Elements exporter services', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const gridInstance = { id: 'grid-instance' };
    const gridElement = { ngElementStrategy: { componentRef: { instance: gridInstance } } };

    describe('IgcCsvExporterService', () => {
        const options = new IgxCsvExporterOptions('Test', CsvFileTypes.CSV);

        it('should export the Angular grid instance behind a custom element', () => {
            const exportSpy = vi.spyOn(IgxCsvExporterService.prototype, 'export').mockImplementation(() => {});

            new IgcCsvExporterService().export(gridElement as any, options);

            expect(exportSpy).toHaveBeenCalledTimes(1);
            expect(exportSpy).toHaveBeenCalledWith(gridInstance, options);
        });

        it('should export the passed grid as is when it is not a custom element', () => {
            const exportSpy = vi.spyOn(IgxCsvExporterService.prototype, 'export').mockImplementation(() => {});
            const uninitializedElement = { ngElementStrategy: { componentRef: null } };

            const service = new IgcCsvExporterService();
            service.export(gridInstance as any, options);
            service.export(uninitializedElement as any, options);

            expect(exportSpy).toHaveBeenNthCalledWith(1, gridInstance, options);
            expect(exportSpy).toHaveBeenNthCalledWith(2, uninitializedElement, options);
        });
    });

    describe('IgcExcelExporterService', () => {
        const options = new IgxExcelExporterOptions('Test');

        it('should export the Angular grid instance behind a custom element', () => {
            const exportSpy = vi.spyOn(IgxExcelExporterService.prototype, 'export').mockImplementation(() => {});

            new IgcExcelExporterService().export(gridElement as any, options);

            expect(exportSpy).toHaveBeenCalledTimes(1);
            expect(exportSpy).toHaveBeenCalledWith(gridInstance, options);
        });

        it('should export the passed grid as is when it is not a custom element', () => {
            const exportSpy = vi.spyOn(IgxExcelExporterService.prototype, 'export').mockImplementation(() => {});
            const uninitializedElement = { ngElementStrategy: { componentRef: null } };

            const service = new IgcExcelExporterService();
            service.export(gridInstance as any, options);
            service.export(uninitializedElement as any, options);

            expect(exportSpy).toHaveBeenNthCalledWith(1, gridInstance, options);
            expect(exportSpy).toHaveBeenNthCalledWith(2, uninitializedElement, options);
        });
    });
});
