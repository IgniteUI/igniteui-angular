import type { Element, Text } from '@angular/compiler';
import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import type { Options } from '../../schematics/interfaces/options';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, getAttribute, getSourceOffset, hasAttribute, parseFile } from '../common/util';
// use bare specifier to escape the schematics encapsulation for the dynamic import:
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.js';

const version = '13.0.0';

export default (options: Options): Rule =>
    async (host: Tree, context: SchematicContext) => {
        context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

        const update = new UpdateChanges(__dirname, host, context);
        const changes = new Map<string, FileChange[]>();
        const tsFiles = update.tsFiles;
        const SERVICES = ['IgxCsvExporterService', 'IgxExcelExporterService'];
        const TAGS = ['igx-grid', 'igx-tree-grid', 'igx-hierarchical-grid', 'igx-row-island'];
        const toolbarProp = ['[showToolbar]', 'showToolbar', '[toolbarTitle]', 'toolbarTitle',
        '[columnHiding]', 'columnHiding', '[columnHidingTitle]', 'columnHidingTitle', '[hiddenColumnsText]', 'hiddenColumnsText',
        '[columnPinning]', 'columnPinning', '[columnPinningTitle]', 'columnPinningTitle', '[pinnedColumnsText]', 'pinnedColumnsText',
        '[exportExcel]', 'exportExcel', '[exportExcelText]', 'exportExcelText',
        '[exportCsv]', 'exportCsv', '[exportCsvText]', 'exportCsvText', '[exportText]', 'exportText'];
        const actionsLeft = ['igx-grid-toolbar-advanced-filtering'];
        const { HtmlParser } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');

        const moduleTsFiles = tsFiles.filter(x => x.endsWith('.module.ts'));
        for (const path of moduleTsFiles) {
            let content = host.read(path)?.toString();
            const servicesInFile = [];
            SERVICES.forEach(service => {
                if (content.indexOf(service) > -1) {
                    servicesInFile.push(service);
                }
            });

            if (servicesInFile.length > 0) {
                let newLine = '\n';
                if (content.indexOf('\r\n') > -1) {
                    newLine = '\r\n';
                }

                const comment =
                    '// ' + servicesInFile.join(' and ') + ' no longer need to be manually provided and can be safely removed.' + newLine;
                content = comment + content;
                host.overwrite(path, content);
            }
        }

    const applyChanges = () => {
        for (const [path, change] of changes.entries()) {
            let buffer = host.read(path)?.toString();
            change.sort((c, c1) => c.position - c1.position)
                .reverse()
                .forEach(c => buffer = c.apply(buffer));

            host.overwrite(path, buffer);
        }
    };

    const addChange = (path: string, change: FileChange) => {
        if (changes.has(path)) {
            changes.get(path).push(change);
        } else {
            changes.set(path, [change]);
        }
    };

    const buildToolbar = (node, attributes) => {
        let result = '';
        const toolbar = findElementNodes(node, ['igx-grid-toolbar'])[0];
        result += `\n<igx-grid-toolbar`;
        const showToolbar = !toolbar || attributes['showToolbar']?.value ? attributes['showToolbar'] : getAttribute(toolbar as Element, ['*ngIf', '[*gIf]'])[0];
        if (showToolbar && showToolbar.value) {
            result += ` *ngIf="${showToolbar.value}"`;
        }
        result += '>'

        const toolbarTitle = toolbar ? findElementNodes([toolbar], ['igx-grid-toolbar-title'])[0] : null;
        const title = !toolbarTitle || attributes['toolbarTitle']?.value ? attributes['toolbarTitle'] : (((toolbarTitle as Element).children)[0] as Text);
        if (title && title.value) {
            result += `\n<igx-grid-toolbar-title>${title.value}</igx-grid-toolbar-title>`
        }

        // has actions
        const hasHiding = Object.keys(attributes).filter(x => x.toLowerCase().includes('hid')).length > 0 || !!(toolbar && findElementNodes([toolbar], ['igx-grid-toolbar-hiding'])[0]);
        const hasPinning = Object.keys(attributes).filter(x => x.toLowerCase().includes('pin')).length > 0 || !!(toolbar && findElementNodes([toolbar], ['igx-grid-toolbar-pinning'])[0]);
        const hasExporting = Object.keys(attributes).filter(x => x.toLowerCase().includes('export')).length > 0 || !!(toolbar && findElementNodes([toolbar], ['igx-grid-toolbar-exporter'])[0]);
        const hasActions = hasHiding || hasPinning || hasExporting;

        if (hasActions) {
            result += '\n<igx-grid-toolbar-actions>';
        }

        const hiding = toolbar ? findElementNodes([toolbar], ['igx-grid-toolbar-hiding'])[0] : null;
        const showHiding = !hiding || attributes['columnHiding']?.value ? attributes['columnHiding'] : getAttribute(hiding as Element, ['*ngIf', '[*ngIf]'])[0];

        if (hasHiding) {
            result += `\n<igx-grid-toolbar-hiding`;
        }
        if (showHiding && showHiding.value) {
            result += `${showHiding.value !== "'true'" ? ` *ngIf="${showHiding.value}"` : ''}`;
        }
        const hidingTitle = !hiding || attributes['columnHidingTitle']?.value ? attributes['columnHidingTitle'] : getAttribute(hiding as Element, ['title', '[title]'])[0];
        if (hidingTitle && hidingTitle.value) {
            result += ` title="${hidingTitle.value}"`;
        }
        let buttonText = !hiding || attributes['hiddenColumnsText']?.value ? attributes['hiddenColumnsText'] : getAttribute(hiding as Element, ['buttonText', '[buttonText]'])[0];
        if (buttonText && buttonText.value) {
            result += ` buttonText="${buttonText.value}"`;
        }
        if (hasHiding) {
            result += '></igx-grid-toolbar-hiding>';
        }

        const pinning = toolbar ? findElementNodes([toolbar], ['igx-grid-toolbar-pinning'])[0] : null;
        const showPinning = !pinning || attributes['columnPinning']?.value ? attributes['columnPinning'] : getAttribute(pinning as Element, ['*ngIf', '[*ngIf]'])[0];
        if (hasPinning) {
            result += `\n<igx-grid-toolbar-pinning`;
        }
        if (showPinning && showPinning.value) {
            result += `${showPinning.value !== "'true'" ? ` *ngIf="${showPinning.value}"` : ''}`;
        }
        const pinningTitle = !pinning || attributes['columnPinningTitle']?.value ? attributes['columnPinningTitle'] : getAttribute(pinning as Element, ['title', '[title]'])[0];
        if (pinningTitle && pinningTitle.value) {
            result += ` title="${pinningTitle.value}"`;
        }
        buttonText = !pinning || attributes['pinnedColumnsText']?.value ? attributes['pinnedColumnsText'] : getAttribute(pinning as Element, ['buttonText', '[buttonText]'])[0];
        if (buttonText && buttonText.value) {
            result += ` buttonText="${buttonText.value}"`;
        }
        if (hasPinning) {
            result += '></igx-grid-toolbar-pinning>';
        }

        const exporting = toolbar ? findElementNodes([toolbar], ['igx-grid-toolbar-exporter'])[0] : null;
        const showExcelExporter = !exporting || attributes['exportExcel']?.value ? attributes['exportExcel'] : getAttribute(exporting as Element, ['exportExcel', '[exportExcel]'])[0];
        const showCsvExporter = !exporting || attributes['exportCsv']?.value ? attributes['exportCsv'] : getAttribute(exporting as Element, ['exportCSV', '[exportCSV]'])[0];

        if (hasExporting) {
            result += `\n<igx-grid-toolbar-exporter`;
        }
        if (showExcelExporter && showExcelExporter.value) {
            result += ` exportExcel="${showExcelExporter.value}"`;
        }
        if (showCsvExporter && showCsvExporter.value) {
            result += ` exportCSV="${showCsvExporter.value}"`;
        }
        if (hasExporting) {
            result += '>';
        }

        const excelTitle = !exporting || attributes['exportExcelText']?.value ? attributes['exportExcelText'] : getExportText(exporting, 'excelText');
        if (excelTitle && excelTitle.value) {
            result += excelTitle.template ? '\n' + excelTitle.value : `\n<span excelText>${excelTitle.value}</span>`;
        }

        const csvTitle = !exporting || attributes['exportCsvText']?.value ? attributes['exportCsvText'] : getExportText(exporting, 'csvText');
        if (csvTitle && csvTitle.value) {
            result += csvTitle.template ? '\n' + csvTitle.value : `\n<span csvText>${csvTitle.value}</span>`;
        }

        const exportTitle = !exporting || attributes['exportText']?.value ? attributes['exportText'] : getExportText(exporting, 'text');
        if (exportTitle && exportTitle.value) {
            result += '\n' + exportTitle.value;
        }
        if (hasExporting) {
            result += '\n</igx-grid-toolbar-exporter>';
        }

        //add any actions left
        if (toolbar) {
            const actions = findElementNodes([toolbar], actionsLeft);
            actions.forEach(action => {
                const { startTag, file, endTag } = getSourceOffset(action as Element);
                const text = file.content.substring(startTag.start, endTag.end);
                result += '\n' + text;
            });
        }

        if (hasActions) {
            result += '\n</igx-grid-toolbar-actions>';
        }
        const toolbarChildren = (toolbar as Element)?.children.filter(child => (child as Element).name && !(child as Element).name.includes('toolbar'));
        toolbarChildren?.forEach(child => {
            const { startTag, endTag, file } = getSourceOffset(child as Element);
            const replaceText = file.content.substring(startTag.start, endTag.end);
            result += '\n' + replaceText;
        });

        return result + `\n</igx-grid-toolbar>`;
    };

    const clearOldToolbar = (grid) => {
        const node = findElementNodes(grid, 'igx-grid-toolbar')[0];
        if (!node) {
            return;
        }
        const { startTag, endTag, file } = getSourceOffset(node as Element);
        const replaceText = file.content.substring(startTag.start, endTag.end);
        addChange(file.url, new FileChange(startTag.start, '', replaceText, 'replace'));

        applyChanges();
        changes.clear();
    }

    const getExportText = (exporter, type) => {
        const element = exporter.children.find(el => {
            if (type === 'text' && !!el.value && el.value.trim().length > 0) {
                return el;
            } else if (!!el.attrs && hasAttribute(el as Element, type)) {
                return el;
            }
            return undefined;
        });
        if (!element) {
            return '';
        }
        if (type !== 'text') {
            const { startTag, endTag, file } = getSourceOffset(element as Element);
            const replaceText = file.content.substring(startTag.start, endTag.end);
            return { value: replaceText, template: true };
        }
        return element;
    }

    for (const path of update.templateFiles) {
        //update toolbar
        const tags = TAGS.slice(0, 3);
        findElementNodes(parseFile(new HtmlParser(), host, path), tags)
            .filter(grid => hasAttribute(grid as Element, toolbarProp))
            .map(node => getSourceOffset(node as Element))
            .reverse()
            .forEach(offset => {
                const { startTag, file, node } = offset;
                const attributes = new Object();

                getAttribute(node, toolbarProp).forEach(attr => attributes[attr.name.replace(/[\[\]]+/g, '')] =
                    { name: attr.name.replace(/[\[\]]+/g, ''), value: attr.value });
                const text = buildToolbar(node, attributes);
                clearOldToolbar(node);
                addChange(file.url, new FileChange(startTag.end, text));
                applyChanges();
                changes.clear();
            });
        //update row island in that file too
        findElementNodes(parseFile(new HtmlParser(), host, path), 'igx-row-island')
            .filter(grid => hasAttribute(grid as Element, toolbarProp))
            .map(node => getSourceOffset(node as Element))
            .reverse()
            .forEach(offset => {
                const { startTag, file, node } = offset;
                const attributes = new Object();

                getAttribute(node, toolbarProp).forEach(attr => attributes[attr.name.replace(/[\[\]]+/g, '')] =
                    { name: attr.name.replace(/[\[\]]+/g, ''), value: attr.value });
                const text = buildToolbar(node, attributes);
                clearOldToolbar(node);
                addChange(file.url, new FileChange(startTag.end, text));
                applyChanges();
                changes.clear();
            });
    }
    applyChanges();
    changes.clear();
    update.shouldInvokeLS = options['shouldInvokeLS'];
    update.applyChanges();
};
