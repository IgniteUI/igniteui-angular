import { IExcelFile } from "./excel-interfaces";
import { ExcelStrings } from "./excel-strings";
import { WorksheetData } from "./worksheet-data";

import * as JSZip from "jszip/dist/jszip";

export class RootRelsFile implements IExcelFile {
	public WriteElement(folder: JSZip, data: WorksheetData) {
		folder.file(".rels", ExcelStrings._RELS_XML);
	}
}

export class AppFile implements IExcelFile {
	public WriteElement(folder: JSZip, data: WorksheetData) {
		folder.file("app.xml", ExcelStrings.APP_XML);
	}
}

export class CoreFile implements IExcelFile {
	public WriteElement(folder: JSZip, data: WorksheetData) {
		folder.file("core.xml", ExcelStrings.CORE_XML);
	}
}

export class WorkbookRelsFile implements IExcelFile {
	public WriteElement(folder: JSZip, data: WorksheetData) {
		const hasSharedStrings = data.cachedValues && data.cachedValues.length > 0;
		folder.file("workbook.xml.rels", ExcelStrings.getWorkbookRels(hasSharedStrings));
	}
}

export class ThemeFile implements IExcelFile {
	public WriteElement(folder: JSZip, data: WorksheetData) {
		folder.file("theme1.xml", ExcelStrings.THEME1_XML);
	}
}

export class WorksheetFile implements IExcelFile {
	public WriteElement(folder: JSZip, data: WorksheetData) {
		let sheetData: string;
		let dimension: string;
		const values = data.cachedValues;

		if (!values || values.length === 0) {
			sheetData = "<sheetData/>";
			dimension = "A1";
		} else {
			sheetData = "<sheetData>";

			for (let i = 0; i < data.rowCount; i++) {
				sheetData += "<row r=\""+ (i + 1) +"\">";

				for (let j =0; j < data.columnCount; j++) {
					let column = String.fromCharCode(65 + j) + (i + 1);
					sheetData += "<c r=\""+ column +"\" t=\"s\"><v>" + values[i * data.columnCount + j] + "</v></c>";
				}
				sheetData += "</row>";
			}
			sheetData += "</sheetData>";
			dimension = "A1:" + String.fromCharCode(64 + data.columnCount) + data.rowCount;
		}
		folder.file("sheet1.xml", ExcelStrings.getSheetXML(dimension, sheetData));
	}
}

export class StyleFile implements IExcelFile {
	public WriteElement(folder: JSZip, options: WorksheetData) {
		folder.file("styles.xml", ExcelStrings.STYLES_XML);
	}
}

export class WorkbookFile implements IExcelFile {
	public WriteElement(folder: JSZip, options: WorksheetData) {
		folder.file("workbook.xml", ExcelStrings.WORKBOOK_XML);
	}
}

export class ContentTypesFile implements IExcelFile {
	public WriteElement(folder: JSZip, data: WorksheetData) {
		const hasSharedStrings = data.cachedValues && data.cachedValues.length > 0;
		folder.file("[Content_Types].xml", ExcelStrings.getContentTypesXML(hasSharedStrings));
	}
}

export class SharedStringsFile implements IExcelFile {
	public WriteElement(folder: JSZip, options: WorksheetData) {
		const dict = options.dataDictionary;
		const sortedValues = dict.getSortedValues();
		const sharedStrings = new Array<string>(sortedValues.length);

		for (let i = 0; i < sortedValues.length; i++) {
			const value = sortedValues[i];
			sharedStrings[i] = "<si><t>" + value + "</t></si>";
		}

		folder.file("sharedStrings.xml", ExcelStrings.getSharedStringXML(
						options.cachedValues.length,
						sortedValues.length,
						sharedStrings.join(""))
					);

	}
}