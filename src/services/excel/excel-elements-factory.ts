import {
	ExcelFileTypes,
	ExcelFolderTypes
} from "./excel-enums";

import {
	RootRelsFile,
	AppFile,
	CoreFile,
	WorkbookRelsFile,
	ThemeFile,
	WorksheetFile,
	StyleFile,
	WorkbookFile,
	ContentTypesFile,
	SharedStringsFile,
	TablesFile,
	WorksheetRelsFile
} from "./excel-files";

import {
	RootExcelFolder,
	RootRelsExcelFolder,
	DocPropsExcelFolder,
	XLExcelFolder,
	XLRelsExcelFolder,
	TablesExcelFolder,
	ThemeExcelFolder,
	WorksheetsExcelFolder,
	WorksheetsRelsExcelFolder,
} from "./excel-folders";

import {
	IExcelFile,
	IExcelFolder
} from "./excel-interfaces";

export class ExcelElementsFactory {
	// Folder types
	private static _rootExcelFolder: RootExcelFolder = null;
	private static _rootRelsExcelFolder: RootRelsExcelFolder = null;
	private static _docPropsExcelFolder: DocPropsExcelFolder = null;
	private static _xlExcelFolder: XLExcelFolder = null;
	private static _xlRelsExcelFolder: XLRelsExcelFolder = null;
	private static _themeExcelFolder: ThemeExcelFolder = null;
	private static _worksheetsExcelFolder: WorksheetsExcelFolder = null;
	private static _worksheetsRelsExcelFolder: WorksheetsRelsExcelFolder = null;
	private static _tablesExcelFolder: TablesExcelFolder = null;

	// File types
	private static _rootRelsFile: RootRelsFile = null;
	private static _appFile: AppFile = null;
	private static _coreFile: CoreFile = null;
	private static _workbookRelsFile: WorkbookRelsFile = null;
	private static _themeFile: ThemeFile = null;
	private static _worksheetFile: WorksheetFile = null;
	private static _styleFile: StyleFile = null;
	private static _workbookFile: WorkbookFile = null;
	private static _contentTypesFile: ContentTypesFile = null;
	private static _sharedStringsFile: SharedStringsFile = null;
	private static _worksheetRelsFile: WorksheetRelsFile = null;
	private static _tablesFile: TablesFile = null;

	public static getExcelFolder(type: ExcelFolderTypes): IExcelFolder{
		switch(type) {
			case ExcelFolderTypes.RootExcelFolder:
				if (ExcelElementsFactory._rootExcelFolder === null) {
					ExcelElementsFactory._rootExcelFolder = new RootExcelFolder();
				}
				return ExcelElementsFactory._rootExcelFolder;
			case ExcelFolderTypes.RootRelsExcelFolder:
				if (ExcelElementsFactory._rootRelsExcelFolder === null) {
					ExcelElementsFactory._rootRelsExcelFolder = new RootRelsExcelFolder();
				}
				return ExcelElementsFactory._rootRelsExcelFolder;
			case ExcelFolderTypes.DocPropsExcelFolder:
				if (ExcelElementsFactory._docPropsExcelFolder === null) {
					ExcelElementsFactory._docPropsExcelFolder = new DocPropsExcelFolder();
				}
				return ExcelElementsFactory._docPropsExcelFolder;
			case ExcelFolderTypes.XLExcelFolder:
				if (ExcelElementsFactory._xlExcelFolder === null) {
					ExcelElementsFactory._xlExcelFolder = new XLExcelFolder();
				}
				return ExcelElementsFactory._xlExcelFolder;
			case ExcelFolderTypes.XLRelsExcelFolder:
				if (ExcelElementsFactory._xlRelsExcelFolder === null) {
					ExcelElementsFactory._xlRelsExcelFolder = new XLRelsExcelFolder();
				}
				return ExcelElementsFactory._xlRelsExcelFolder;
			case ExcelFolderTypes.ThemeExcelFolder:
				if (ExcelElementsFactory._themeExcelFolder === null) {
					ExcelElementsFactory._themeExcelFolder = new ThemeExcelFolder();
				}
				return ExcelElementsFactory._themeExcelFolder;
			case ExcelFolderTypes.WorksheetsExcelFolder:
				if (ExcelElementsFactory._worksheetsExcelFolder === null) {
					ExcelElementsFactory._worksheetsExcelFolder = new WorksheetsExcelFolder();
				}
				return ExcelElementsFactory._worksheetsExcelFolder;
			case ExcelFolderTypes.WorksheetsRelsExcelFolder:
				if (ExcelElementsFactory._worksheetsRelsExcelFolder === null ) {
					ExcelElementsFactory._worksheetsRelsExcelFolder = new WorksheetsRelsExcelFolder();
				}
				return ExcelElementsFactory._worksheetsRelsExcelFolder;
			case ExcelFolderTypes.TablesExcelFolder:
				if (ExcelElementsFactory._tablesExcelFolder === null ) {
					ExcelElementsFactory._tablesExcelFolder = new TablesExcelFolder();
				}
				return ExcelElementsFactory._tablesExcelFolder;
			default:
				throw new Error("Unknown excel folder type!");
		}
	}

	public static getExcelFile(type: ExcelFileTypes): IExcelFile{
		switch(type) {
			case ExcelFileTypes.RootRelsFile:
				if (ExcelElementsFactory._rootRelsFile === null) {
					ExcelElementsFactory._rootRelsFile = new RootRelsFile();
				}
				return ExcelElementsFactory._rootRelsFile;
			case ExcelFileTypes.AppFile:
				if (ExcelElementsFactory._appFile === null) {
					ExcelElementsFactory._appFile = new AppFile();
				}
				return ExcelElementsFactory._appFile;
			case ExcelFileTypes.CoreFile:
				if (ExcelElementsFactory._coreFile === null) {
					ExcelElementsFactory._coreFile = new CoreFile();
				}
				return ExcelElementsFactory._coreFile;
			case ExcelFileTypes.WorkbookRelsFile:
				if (ExcelElementsFactory._workbookRelsFile === null) {
					ExcelElementsFactory._workbookRelsFile = new WorkbookRelsFile();
				}
				return ExcelElementsFactory._workbookRelsFile;
			case ExcelFileTypes.ThemeFile:
				if (ExcelElementsFactory._themeFile === null) {
					ExcelElementsFactory._themeFile = new ThemeFile();
				}
				return ExcelElementsFactory._themeFile;
			case ExcelFileTypes.WorksheetFile:
				if (ExcelElementsFactory._worksheetFile === null) {
					ExcelElementsFactory._worksheetFile = new WorksheetFile();
				}
				return ExcelElementsFactory._worksheetFile;
			case ExcelFileTypes.StyleFile:
				if (ExcelElementsFactory._styleFile === null) {
					ExcelElementsFactory._styleFile = new StyleFile();
				}
				return ExcelElementsFactory._styleFile;
			case ExcelFileTypes.WorkbookFile:
				if (ExcelElementsFactory._workbookFile === null) {
					ExcelElementsFactory._workbookFile = new WorkbookFile();
				}
				return ExcelElementsFactory._workbookFile;
			case ExcelFileTypes.ContentTypesFile:
				if (ExcelElementsFactory._contentTypesFile === null) {
					ExcelElementsFactory._contentTypesFile = new ContentTypesFile();
				}
				return ExcelElementsFactory._contentTypesFile;
			case ExcelFileTypes.SharedStringsFile:
				if (ExcelElementsFactory._sharedStringsFile === null) {
					ExcelElementsFactory._sharedStringsFile = new SharedStringsFile();
				}
				return ExcelElementsFactory._sharedStringsFile;
			case ExcelFileTypes.WorksheetRelsFile:
				if (ExcelElementsFactory._worksheetRelsFile === null) {
					ExcelElementsFactory._worksheetRelsFile = new WorksheetRelsFile();
				}
				return ExcelElementsFactory._worksheetRelsFile;
			case ExcelFileTypes.TablesFile:
				if (ExcelElementsFactory._tablesFile === null) {
					ExcelElementsFactory._tablesFile = new TablesFile();
				}
				return ExcelElementsFactory._tablesFile;
			default:
				throw Error("Unknown excel file type!");
		}
	}
}
