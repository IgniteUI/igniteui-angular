import { Injectable } from "@angular/core";
import { ExportUtilities } from "../exporter-common/export-utilities";

@Injectable()
export class IgxCsvExporterService {



    private SaveCSVFile(data: string, fileName: string): void {
        // const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
        // if (navigator.msSaveBlob) { // IE 10+
        //     navigator.msSaveBlob(blob, fileName);
        // } else {
        //     const a = document.createElement("a");
        //     if (a.download !== undefined) { // feature detection
        //         // Browsers that support HTML5 download attribute
        //         const url = URL.createObjectURL(blob);
        //         a.setAttribute("href", url);
        //         a.setAttribute("download", fileName + ".csv");
        //         a.style.visibility = "hidden";
        //         document.body.appendChild(a);
        //         a.click();
        //         document.body.removeChild(a);
        //     }
        // }
        const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
        ExportUtilities.saveBlobToFile(blob, fileName, ".csv");
    }

    private SaveTSVFile(data: string, fileName: string): void {
        const blob = new Blob([data], { type: "text/tab-separated-values;charset=utf-8;" });
        ExportUtilities.saveBlobToFile(blob, fileName, ".tsv");
    }

    private SaveTABFile(data: string, fileName: string): void {
        const blob = new Blob([data], { type: "text/tab-separated-values;charset=utf-8;" });
        ExportUtilities.saveBlobToFile(blob, fileName, ".tab");
    }
}
