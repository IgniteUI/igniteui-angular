
import { ExcelFileTypes } from './excel-enums';

export class JSZipFiles {
    public static AllFilesNames = [
        "_rels/",
        "_rels/.rels",
        "docProps/",
        "docProps/app.xml",
        "docProps/core.xml",
        "xl/",
        "xl/_rels/",
        "xl/_rels/workbook.xml.rels",
        "xl/theme/",
        "xl/theme/theme1.xml",
        "xl/worksheets/",
        "xl/worksheets/sheet1.xml",
        "xl/styles.xml",
        "xl/workbook.xml",
        "[Content_Types].xml",
        "xl/worksheets/_rels/",
        "xl/worksheets/_rels/sheet1.xml.rels",
        "xl/tables/",
        "xl/tables/table1.xml",
        "xl/sharedStrings.xml"
    ];

    public static DataFilesAndFoldersNames  = [
        "xl/worksheets/_rels/",
        "xl/worksheets/_rels/sheet1.xml.rels",
        "xl/worksheets/sheet1.xml",
        "xl/tables/",
        "xl/tables/table1.xml",
        "xl/sharedStrings.xml"
    ];

    public static TemplatesNames = [
        "_rels/",
        "_rels/.rels",
        "docProps/",
        "docProps/app.xml",
        "docProps/core.xml",
        "xl/",
        "xl/_rels/",
        "xl/_rels/workbook.xml.rels",
        "xl/theme/",
        "xl/theme/theme1.xml",
        "xl/worksheets/",
        "xl/worksheets/sheet1.xml",
        "xl/styles.xml",
        "xl/workbook.xml",
        "[Content_Types].xml"
    ];

    public static TemplateFiles = [
        { name: "_rels/.rels", type: ExcelFileTypes.RootRelsFile },
        { name: "docProps/app.xml", type: ExcelFileTypes.AppFile },
        { name: "docProps/core.xml", type: ExcelFileTypes.CoreFile },
        { name: "xl/_rels/workbook.xml.rels", type: ExcelFileTypes.WorkbookRelsFile },
        { name: "xl/theme/theme1.xml", type: ExcelFileTypes.ThemeFile },
        { name: "xl/styles.xml", type: ExcelFileTypes.StyleFile },
        { name: "xl/workbook.xml", type: ExcelFileTypes.WorkbookFile },
        { name: "xl/worksheets/sheet1.xml", type: ExcelFileTypes.WorksheetFile },
        { name: "[Content_Types].xml", type: ExcelFileTypes.ContentTypesFile },
    ];

    public static DataFiles = [
        { name: "xl/worksheets/_rels/sheet1.xml.rels", type: ExcelFileTypes.WorksheetRelsFile },
        { name: "xl/worksheets/sheet1.xml", type: ExcelFileTypes.WorksheetFile  },
        { name: "xl/tables/table1.xml", type: ExcelFileTypes.TablesFile },
        { name: "xl/sharedStrings.xml", type: ExcelFileTypes.SharedStringsFile }
    ];

    public static Files = [
        { name: "_rels/.rels", type: ExcelFileTypes.RootRelsFile },
        { name: "docProps/app.xml", type: ExcelFileTypes.AppFile },
        { name: "docProps/core.xml", type: ExcelFileTypes.CoreFile },
        { name: "xl/_rels/workbook.xml.rels", type: ExcelFileTypes.WorkbookRelsFile },
        { name: "xl/theme/theme1.xml", type: ExcelFileTypes.ThemeFile },
        { name: "xl/workbook.xml", type: ExcelFileTypes.WorkbookFile },
        { name: "xl/worksheets/sheet1.xml", type: ExcelFileTypes.WorksheetFile },
        { name: "xl/styles.xml", type: ExcelFileTypes.StyleFile },
        { name: "[Content_Types].xml", type: ExcelFileTypes.ContentTypesFile },
        { name: "xl/worksheets/_rels/sheet1.xml.rels", type: ExcelFileTypes.WorksheetRelsFile },
        { name: "xl/tables/table1.xml", type: ExcelFileTypes.TablesFile },
        { name: "xl/sharedStrings.xml", type: ExcelFileTypes.SharedStringsFile }
    ]

    public static FoldersNames : string[] = [
        "_rels/",
        "docProps/",
        "xl/",
        "xl/_rels/",
        "xl/tables/",
        "xl/theme/",
        "xl/worksheets/",
        "xl/worksheets/_rels/",
    ];

    public static FilesNames : string[] = [
        "_rels/.rels",
        "docProps/app.xml",
        "docProps/core.xml",
        "xl/_rels/workbook.xml.rels",
        "xl/sharedStrings.xml",
        "xl/styles.xml",
        "xl/tables/table1.xml",
        "xl/theme/theme1.xml",
        "xl/workbook.xml",
        "xl/worksheets/_rels/sheet1.xml.rels",
        "xl/worksheets/sheet1.xml",
        "[Content_Types].xml"
    ];

    public static getTablesXML(tableData : string) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="1" name="Table1" displayName="Table1" ${ tableData }<tableStyleInfo name="TableStyleMedium2" showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/></table>`;
    }

    public static getSharedStringsXML(stringsData : string) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ${ stringsData }</sst>`;
    }

    public static getContentTypesXML(hasData = true) {
        let typesData = (hasData) ? `<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
    <Override PartName="/xl/tables/table1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>` : "";

        return `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
    <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
    <Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
    <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
    <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
    <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>${typesData}
</Types>`;
    }

    public static getSheetDataFile(sheetData : string, hasValues) {
        let xml = (hasValues) ? `<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">${ sheetData }<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/><tableParts count="1"><tablePart r:id="rId1"/></tableParts></worksheet>` :
`<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"><dimension ref="A1"/><sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><sheetData/><pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>`

        return xml;
    }

    public static createExpectedXML(xmlFile : ExcelFileTypes, currentData = "", hasValues = true) : any {
        let resultXml;
        switch (xmlFile) {
            case ExcelFileTypes.RootRelsFile:
                resultXml = {
                    name: JSZipFiles.TemplatesNames[1],
                    content : `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
                };
                break;
            case ExcelFileTypes.AppFile:
                resultXml = {
                    name: JSZipFiles.TemplatesNames[3],
                    content : `<?xml version="1.0" encoding="UTF-8"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Excel</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>Sheet1</vt:lpstr></vt:vector></TitlesOfParts><Company></Company><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>16.0300</AppVersion></Properties>`
                };
                break;
            case ExcelFileTypes.CoreFile:
                resultXml = {
                    name: JSZipFiles.TemplatesNames[4],
                    content : `<?xml version="1.0" encoding="UTF-8"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>Dimitar Davidkov</dc:creator><cp:lastModifiedBy></cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">2015-06-05T18:17:20Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2015-06-05T18:17:26Z</dcterms:modified></cp:coreProperties>`
                };
                break;
            case ExcelFileTypes.WorkbookRelsFile:
            let typesData = (hasValues) ? `<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml" />` : "";
                resultXml = {
                    name: JSZipFiles.TemplatesNames[7],
                    content : `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>${typesData}</Relationships>`
                };
                break;
            case ExcelFileTypes.ThemeFile:
                resultXml = {
                    name: JSZipFiles.TemplatesNames[9],
                    content : `<?xml version="1.0" encoding="UTF-8"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"></a:theme>`
                };
                break;
            case ExcelFileTypes.StyleFile:
                resultXml = {
                    name: JSZipFiles.TemplatesNames[12],
                    content : `<?xml version="1.0" encoding="UTF-8"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac x16r2" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:x16r2="http://schemas.microsoft.com/office/spreadsheetml/2015/02/main"><fonts count="1" x14ac:knownFonts="1"><font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/><extLst><ext uri="{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main"><x14:slicerStyles defaultSlicerStyle="SlicerStyleLight1"/></ext><ext uri="{9260A510-F301-46a8-8635-F512D64BE5F5}" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main"><x15:timelineStyles defaultTimelineStyle="TimeSlicerStyleLight1"/></ext></extLst></styleSheet>`
                };
                break;
            case ExcelFileTypes.WorkbookFile:
                resultXml = {
                    name: JSZipFiles.TemplatesNames[13],
                    content : `<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x15" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main"><fileVersion appName="xl" lastEdited="6" lowestEdited="6" rupBuild="14420"/><workbookPr filterPrivacy="1" defaultThemeVersion="164011"/><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="22260" windowHeight="12645"/></bookViews><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="162913"/><extLst><ext uri="{140A7094-0E35-4892-8432-C4D2E57EDEB5}" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main"><x15:workbookPr chartTrackingRefBase="1"/></ext></extLst></workbook>`
                };
                break;
            case ExcelFileTypes.WorksheetRelsFile:
                resultXml = {
                    name: JSZipFiles.DataFilesAndFoldersNames[1],
                    content : `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
                    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table1.xml"/></Relationships>`
                };
                break;
            case ExcelFileTypes.WorksheetFile:
                resultXml = {
                    name: JSZipFiles.TemplatesNames[11],
                    content : JSZipFiles.getSheetDataFile(currentData, hasValues)
                };
                break;
            case ExcelFileTypes.ContentTypesFile:
                resultXml = {
                    name: JSZipFiles.TemplatesNames[14],
                    content : this.getContentTypesXML(hasValues)
                };
                break;
            case ExcelFileTypes.SharedStringsFile:
                resultXml = {
                    name: JSZipFiles.DataFilesAndFoldersNames[4],
                    content : JSZipFiles.getSharedStringsXML(currentData)
                };
                break;
            case ExcelFileTypes.TablesFile:
                resultXml = {
                    name: JSZipFiles.DataFilesAndFoldersNames[3],
                    content : JSZipFiles.getTablesXML(currentData)
                };
                break;
        }

        return resultXml;
    }
}

