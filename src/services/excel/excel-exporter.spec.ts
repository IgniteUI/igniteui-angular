import { IgxExcelExporterService } from './excel-exporter';
import { ValueData, ExportTestDataService } from './test-data.service';

fdescribe('Excel Exporter', () => {
    let testData : ExportTestDataService;
    let exporter : IgxExcelExporterService;

    beforeEach(() => {
        exporter = new IgxExcelExporterService();
        testData = new ExportTestDataService();
    })

    /* ExportData() tests */
    fit('should not fail when data is empty.', () => {

        // spyOn(exporter, "ExportData");
        exporter.ExportData([], "EmptyData");

        // expect(exporter.ExportData).toHaveBeenCalledWith([], "EmptyData");
    });

    it('should export empty objects successfully.', () => {
        exporter.ExportData(testData.getEmptyObjectData(), "EmptyObjectsData");
    });

    it('should export string data without headers successfully.', () => {
        exporter.ExportData(testData.getNoHeadersStringData(), "NoHeadersStringData");
    });

    it('should export object data without headers successfully.', () => {
        exporter.ExportData(testData.noHeadersObjectData, "NoHeadersObjectData");
    });

    it('should export data with missing values successfully.', () => {
        exporter.ExportData(testData.contacts, "MissingValues");
    });



    function doesFileExist(urlToFile) {
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', urlToFile, false);
            xhr.send();
             
            if (xhr.status === 404) {
                return false;
            } else {
                return true;
            }
        }

});