import { IgxExcelExporterService } from './excel-exporter';
import { ValueData, ExportTestDataService, JSZipWrapper, JSZipFiles, ObjectComparer } from './test-data.service';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { ExcelStrings } from './excel-strings';

fdescribe('Excel Exporter', () => {
    let testData : ExportTestDataService;
    let exporter : IgxExcelExporterService;
    let wrapper : JSZipWrapper;
    let timesCalled = 0;

    beforeEach(() => {
        exporter = new IgxExcelExporterService();
        testData = new ExportTestDataService();

        exporter.onExportEnded.subscribe((value) => {
            console.log("I was called with " + value.xlsx + " " + ++timesCalled + " time(s).");
            wrapper = new JSZipWrapper(value.xlsx);
        });
    });

    /* ExportData() tests */
   fit('should not fail when data is empty.', (done) => {
        // exporter.ExportData([], new IgxExcelExporterOptions("EmptyData"));
        exportData([], new IgxExcelExporterOptions("EmptyData"))
        // setTimeout(() => {
            .then(()=> {
            let result = ObjectComparer.AreEqual(wrapper.filesAndFoldersNames, JSZipFiles.AllFilesList);
            expect(result).toBe(true);
            wrapper.readFile(JSZipFiles.FilesNamesList[0]);
        });
        // }, 0);
        // setTimeout(() => {
            expect(wrapper.fileContent).toBe(ExcelStrings._RELS_XML);
            done();
        // }, 1000);

    });

    it('should export empty objects successfully.', () => {
        exporter.ExportData(testData.getEmptyObjectData(), new IgxExcelExporterOptions("EmptyObjectsData"));
        // return Promise.resolve(exporter.ExportData(testData.getEmptyObjectData(), new IgxExcelExporterOptions("EmptyObjectsData")))
        // .then(()=>
        // {
        expect(wrapper.fileContent).toBe(ExcelStrings._RELS_XML);
            let result = ObjectComparer.AreEqual(wrapper.filesAndFoldersNames, JSZipFiles.AllFilesList);
            expect(result).toBe(true);
            // done();
        // });


    });

    it('should export string data without headers successfully.', () => {
        exporter.ExportData(testData.getNoHeadersStringData(), new IgxExcelExporterOptions("NoHeadersStringData"));
    });

    it('should export object data without headers successfully.', () => {
        exporter.ExportData(testData.noHeadersObjectData, new IgxExcelExporterOptions("NoHeadersObjectData"));
    });

    it('should export regular data successfully.', () => {
        exporter.ExportData(testData.contacts, new IgxExcelExporterOptions("Contacts"));
    });

    it('should export data with missing values successfully.', () => {
        exporter.ExportData(testData.contactsMissing, new IgxExcelExporterOptions("MissingValues"));
    });

    function exportData(data, options) {
        return Promise.resolve(() => {
             exporter.ExportData(data, options);
        });
    };
});