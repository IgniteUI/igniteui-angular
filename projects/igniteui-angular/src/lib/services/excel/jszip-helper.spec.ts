import { ExcelFileTypes } from './excel-enums';

export class JSZipFiles {
    public static allFilesNames: string[] = [
        '_rels/',
        '_rels/.rels',
        'docProps/',
        'docProps/app.xml',
        'docProps/core.xml',
        'xl/',
        'xl/_rels/',
        'xl/_rels/workbook.xml.rels',
        'xl/theme/',
        'xl/theme/theme1.xml',
        'xl/worksheets/',
        'xl/worksheets/sheet1.xml',
        'xl/styles.xml',
        'xl/workbook.xml',
        '[Content_Types].xml',
        'xl/worksheets/_rels/',
        'xl/worksheets/_rels/sheet1.xml.rels',
        'xl/tables/',
        'xl/tables/table1.xml',
        'xl/sharedStrings.xml'
    ];

    public static dataFilesAndFoldersNames  = [
        'xl/worksheets/_rels/',
        'xl/worksheets/_rels/sheet1.xml.rels',
        'xl/worksheets/sheet1.xml',
        'xl/tables/',
        'xl/tables/table1.xml',
        'xl/sharedStrings.xml'
    ];

    public static hGridDataFilesAndFoldersNames  = [
        'xl/worksheets/sheet1.xml',
        'xl/sharedStrings.xml'
    ];

    public static templatesNames = [
        '_rels/',
        '_rels/.rels',
        'docProps/',
        'docProps/app.xml',
        'docProps/core.xml',
        'xl/',
        'xl/_rels/',
        'xl/_rels/workbook.xml.rels',
        'xl/theme/',
        'xl/theme/theme1.xml',
        'xl/worksheets/',
        'xl/worksheets/sheet1.xml',
        'xl/styles.xml',
        'xl/workbook.xml',
        '[Content_Types].xml'
    ];

    public static templateFiles = [
        { name: '_rels/.rels', type: ExcelFileTypes.RootRelsFile },
        { name: 'docProps/app.xml', type: ExcelFileTypes.AppFile },
        { name: 'docProps/core.xml', type: ExcelFileTypes.CoreFile },
        { name: 'xl/_rels/workbook.xml.rels', type: ExcelFileTypes.WorkbookRelsFile },
        { name: 'xl/theme/theme1.xml', type: ExcelFileTypes.ThemeFile },
        { name: 'xl/styles.xml', type: ExcelFileTypes.StyleFile },
        { name: 'xl/workbook.xml', type: ExcelFileTypes.WorkbookFile },
        { name: 'xl/worksheets/sheet1.xml', type: ExcelFileTypes.WorksheetFile },
        { name: '[Content_Types].xml', type: ExcelFileTypes.ContentTypesFile }
    ];

    public static dataFiles = [
        { name: 'xl/worksheets/_rels/sheet1.xml.rels', type: ExcelFileTypes.WorksheetRelsFile },
        { name: 'xl/worksheets/sheet1.xml', type: ExcelFileTypes.WorksheetFile  },
        { name: 'xl/tables/table1.xml', type: ExcelFileTypes.TablesFile },
        { name: 'xl/sharedStrings.xml', type: ExcelFileTypes.SharedStringsFile }
    ];

    public static files = [
        { name: '_rels/.rels', type: ExcelFileTypes.RootRelsFile },
        { name: 'docProps/app.xml', type: ExcelFileTypes.AppFile },
        { name: 'docProps/core.xml', type: ExcelFileTypes.CoreFile },
        { name: 'xl/_rels/workbook.xml.rels', type: ExcelFileTypes.WorkbookRelsFile },
        { name: 'xl/theme/theme1.xml', type: ExcelFileTypes.ThemeFile },
        { name: 'xl/workbook.xml', type: ExcelFileTypes.WorkbookFile },
        { name: 'xl/worksheets/sheet1.xml', type: ExcelFileTypes.WorksheetFile },
        { name: 'xl/styles.xml', type: ExcelFileTypes.StyleFile },
        { name: '[Content_Types].xml', type: ExcelFileTypes.ContentTypesFile },
        { name: 'xl/worksheets/_rels/sheet1.xml.rels', type: ExcelFileTypes.WorksheetRelsFile },
        { name: 'xl/tables/table1.xml', type: ExcelFileTypes.TablesFile },
        { name: 'xl/sharedStrings.xml', type: ExcelFileTypes.SharedStringsFile }
    ];

    public static foldersNames: string[] = [
        '_rels/',
        'docProps/',
        'xl/',
        'xl/_rels/',
        'xl/tables/',
        'xl/theme/',
        'xl/worksheets/',
        'xl/worksheets/_rels/'
    ];

    public static filesNames: string[] = [
        '_rels/.rels',
        'docProps/app.xml',
        'docProps/core.xml',
        'xl/_rels/workbook.xml.rels',
        'xl/sharedStrings.xml',
        'xl/styles.xml',
        'xl/tables/table1.xml',
        'xl/theme/theme1.xml',
        'xl/workbook.xml',
        'xl/worksheets/_rels/sheet1.xml.rels',
        'xl/worksheets/sheet1.xml',
        '[Content_Types].xml'
    ];

    public static hasDates: boolean;

    /* eslint-disable  max-len */
    public static getTablesXML(tableData: string) {
        return `<?xml version="1.0" encoding="UTF-8"?>\r\n<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="1" name="Table1" displayName="Table1" ` +
`${ tableData }<tableStyleInfo name="TableStyleMedium2" showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/>
</table>`;
    }

    public static getStylesheetXML(): string {
        const cellXfCount = this.hasDates ? 3 : 1;
        const additionalCellXf = this.hasDates ? ` <xf numFmtId="14" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` : '';

        return '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac x16r2" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:x16r2="http://schemas.microsoft.com/office/spreadsheetml/2015/02/main"><fonts count="2" x14ac:knownFonts="1"><font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font><font><sz val="11"/><color rgb="FFB7B7B7"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0D1822"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/> <xf numFmtId="14" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/> <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/><extLst><ext uri="{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main"><x14:slicerStyles defaultSlicerStyle="SlicerStyleLight1"/></ext><ext uri="{9260A510-F301-46a8-8635-F512D64BE5F5}" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main"><x15:timelineStyles defaultTimelineStyle="TimeSlicerStyleLight1"/></ext></extLst></styleSheet>';
    }

    public static getSharedStringsXML(stringsData: string) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ${ stringsData }</sst>`;
    }

    public static getContentTypesXML(hasData = true) {
        const typesData = (hasData) ? `<Override PartName="/xl/sharedStrings.xml" ` +
        `ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>` : ``;

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
    <Override PartName="/xl/tables/table1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>
</Types>`;
    }

    public static getSheetDataFile(sheetData: string, hasValues: boolean, isHGrid: boolean) {
        if (hasValues) {
            const tablePart = isHGrid ? '' : '<tableParts count="1"><tablePart r:id="rId1"/></tableParts>';

            return `<?xml version="1.0" encoding="UTF-8"?>
            <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ` +
            `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ` +
            `xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" ` +
            `xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">${ sheetData }` +
            `<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>${tablePart}</worksheet>`;
        } else {
            return `<?xml version="1.0" encoding="UTF-8"?>
            <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ` +
            `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ` +
            `xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" ` +
            `xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"><dimension ref="A1"/>` +
            `<sheetViews><sheetView tabSelected="1" workbookViewId="0"></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15" ` +
            `x14ac:dyDescent="0.25"/><sheetData/><pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" ` +
            `footer="0.3"/></worksheet>`;
        }
    }

    public static createExpectedXML(xmlFile: ExcelFileTypes, currentData = '', hasValues = true, isHGrid: boolean = false): any {
        let resultXml;
        switch (xmlFile) {
            case ExcelFileTypes.RootRelsFile:
                resultXml = {
                    name: JSZipFiles.templatesNames[1],
                    content : `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" ` +
`Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>` +
`<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" ` +
`Target="docProps/core.xml"/><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/` +
`relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
                };
                break;
            case ExcelFileTypes.AppFile:
                resultXml = {
                    name: JSZipFiles.templatesNames[3],
                    content : `<?xml version="1.0" encoding="UTF-8"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://` +
`schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Excel</Application><DocSecurity>0` +
`</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets` +
`</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="1" ` +
`baseType="lpstr"><vt:lpstr>Sheet1</vt:lpstr></vt:vector></TitlesOfParts><Company></Company><LinksUpToDate>false</LinksUpToDate>` +
`<SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>16.0300</AppVersion></Properties>`
                };
                break;
            case ExcelFileTypes.CoreFile:
                resultXml = {
                    name: JSZipFiles.templatesNames[4],
                    content : `<?xml version="1.0" encoding="UTF-8"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ` +
`xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" ` +
`xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
`<dc:creator></dc:creator><cp:lastModifiedBy></cp:lastModifiedBy><dcterms:created ` +
`xsi:type="dcterms:W3CDTF">2015-06-05T18:17:20Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">` +
`2015-06-05T18:17:26Z</dcterms:modified></cp:coreProperties>`
                };
                break;
            case ExcelFileTypes.WorkbookRelsFile:
                const typesData = (hasValues) ?
                `<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" ` +
                `Target="sharedStrings.xml" />` : '';
                resultXml = {
                    name: JSZipFiles.templatesNames[7],
                    content : `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" ` +
`Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" ` +
`Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/><Relationship Id="rId1" ` +
`Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>${typesData}` +
`</Relationships>`
                };
                break;
            case ExcelFileTypes.ThemeFile:
                // eslint-disable-next-line max-len
                const actualTheme = `<a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="5B9BD5"/></a:accent1><a:accent2><a:srgbClr val="ED7D31"/></a:accent2><a:accent3><a:srgbClr val="A5A5A5"/></a:accent3><a:accent4><a:srgbClr val="FFC000"/></a:accent4><a:accent5><a:srgbClr val="4472C4"/></a:accent5><a:accent6><a:srgbClr val="70AD47"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri Light" panose="020F0302020204030204"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="游ゴシック Light"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="等线 Light"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Times New Roman"/><a:font script="Hebr" typeface="Times New Roman"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="MoolBoran"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Times New Roman"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:majorFont><a:minorFont><a:latin typeface="Calibri" panose="020F0502020204030204"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="游ゴシック"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="等线"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Arial"/><a:font script="Hebr" typeface="Arial"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="DaunPenh"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Arial"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:lumMod val="110000"/><a:satMod val="105000"/><a:tint val="67000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="103000"/><a:tint val="73000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="109000"/><a:tint val="81000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:satMod val="103000"/><a:lumMod val="102000"/><a:tint val="94000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:satMod val="110000"/><a:lumMod val="100000"/><a:shade val="100000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="99000"/><a:satMod val="120000"/><a:shade val="78000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln><a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln><a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="57150" dist="19050" dir="5400000" algn="ctr" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="63000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="170000"/></a:schemeClr></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="93000"/><a:satMod val="150000"/><a:shade val="98000"/><a:lumMod val="102000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:tint val="98000"/><a:satMod val="130000"/><a:shade val="90000"/><a:lumMod val="103000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="63000"/><a:satMod val="120000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/><a:extLst><a:ext uri="{05A4C25C-085E-4340-85A3-A5531E510DB2}"><thm15:themeFamily xmlns:thm15="http://schemas.microsoft.com/office/thememl/2012/main" name="Office Theme" id="{62F939B6-93AF-4DB8-9C6B-D6C7DFDC589F}" vid="{4A3C46E8-61CC-4603-A589-7422A47A8E4A}"/></a:ext></a:extLst>`;
                resultXml = {
                    name: JSZipFiles.templatesNames[9],
                    content : `<?xml version="1.0" encoding="UTF-8"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">${actualTheme}</a:theme>`
                };
                break;
            case ExcelFileTypes.StyleFile:
                resultXml = {
                    name: JSZipFiles.templatesNames[12],
                    content : this.getStylesheetXML()
                };
                break;
            case ExcelFileTypes.WorkbookFile:
                resultXml = {
                    name: JSZipFiles.templatesNames[13],
                    content : `<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/` +
`officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x15" ` +
`xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main"><fileVersion appName="xl" lastEdited="6" lowestEdited="6" ` +
`rupBuild="14420"/><workbookPr filterPrivacy="1" defaultThemeVersion="164011"/><bookViews><workbookView xWindow="0" yWindow="0" ` +
`windowWidth="22260" windowHeight="12645"/></bookViews><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets><calcPr ` +
`calcId="162913"/><extLst><ext uri="{140A7094-0E35-4892-8432-C4D2E57EDEB5}" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml` +
`/2010/11/main"><x15:workbookPr chartTrackingRefBase="1"/></ext></extLst></workbook>`
                };
                break;
            case ExcelFileTypes.WorksheetRelsFile:
                resultXml = {
                    name: JSZipFiles.dataFilesAndFoldersNames[1],
                    content : `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" ` +
`Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table1.xml"/></Relationships>`
                };
                break;
            case ExcelFileTypes.WorksheetFile:
                resultXml = {
                    name: JSZipFiles.templatesNames[11],
                    content : JSZipFiles.getSheetDataFile(currentData, hasValues, isHGrid)
                };
                break;
            case ExcelFileTypes.ContentTypesFile:
                resultXml = {
                    name: JSZipFiles.templatesNames[14],
                    content : this.getContentTypesXML(hasValues)
                };
                break;
            case ExcelFileTypes.SharedStringsFile:
                resultXml = {
                    name: JSZipFiles.dataFilesAndFoldersNames[4],
                    content : JSZipFiles.getSharedStringsXML(currentData)
                };
                break;
            case ExcelFileTypes.TablesFile:
                resultXml = {
                    name: JSZipFiles.dataFilesAndFoldersNames[3],
                    content : JSZipFiles.getTablesXML(currentData)
                };
                break;
            default:
                throw Error('Unexpected Excel file type!');
        }

        return resultXml;
    }

    /* eslint-enable  max-len */
}
