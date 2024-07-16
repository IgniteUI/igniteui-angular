import type { Element } from '@angular/compiler';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, getAttribute, getSourceOffset, hasAttribute, parseFile, serializeNodes } from '../common/util';
// use bare specifier to escape the schematics encapsulation for the dynamic import:
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.js';

const version = '11.0.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`
    );
    const { HtmlParser, getHtmlTagDefinition } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');

    const update = new UpdateChanges(__dirname, host, context);

    const TAGS = ['igx-grid', 'igx-tree-grid', 'igx-hierarchical-grid'];
    const prop = ['[showToolbar]', 'showToolbar'];
    const warnMsg = `\n<!-- Auto migrated template content. Please, check your bindings! -->\n`;
    const changes = new Map<string, FileChange[]>();

    const applyChanges = () => {
        for (const [path, change] of changes.entries()) {
            let buffer = host.read(path).toString();

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


    const makeNgIf = (name: string, value: string) => name.startsWith('[') && value !== 'true';

    // Try to preserve the template context variable binding
    const getTemplateBinding = (node: Element) => {
        const template = findElementNodes([node], ['ng-template'])
            .filter(tmpl => hasAttribute(tmpl as Element, 'igxToolbarCustomContent'))[0];
        if (template) {
            return (template as Element).attrs.find(attr => attr.name.startsWith('let') && attr.value.startsWith('grid'))
                .name.split('-')[1];
        }
        return 'childGrid';
    };

    const moveTemplateIfAny = (grid: Element) => {
        const ngTemplates = findElementNodes([grid], ['ng-template']);
        const toolbarTemplate = ngTemplates.filter(template => hasAttribute(template as Element, 'igxToolbarCustomContent'))[0];
        if (toolbarTemplate) {
            return `${warnMsg}\n${serializeNodes((toolbarTemplate as Element).children, getHtmlTagDefinition).join('')}\n`;
        }
        return '';
    };

    // Row island migration
    for (const path of update.templateFiles) {
        findElementNodes(parseFile(new HtmlParser(), host, path), 'igx-row-island')
            .filter(island => hasAttribute(island as Element, prop))
            .map(island => getSourceOffset(island as Element))
            .forEach(offset => {
                const { startTag, file, node } = offset;
                const binding = getTemplateBinding(node);
                const { name, value } = getAttribute(node, prop)[0];
                // eslint-disable-next-line max-len
                const text = `\n<igx-grid-toolbar [grid]="${binding}" *igxGridToolbar="let ${binding}"${makeNgIf(name, value) ? ` *ngIf="${value}"` : ''}>${moveTemplateIfAny(node)}</igx-grid-toolbar>\n`;
                addChange(file.url, new FileChange(startTag.end, text));
            });
    }

    applyChanges();
    changes.clear();

    // Clear row island templates
    for (const path of update.templateFiles) {
        findElementNodes(parseFile(new HtmlParser(), host, path), 'igx-row-island')
            .filter(grid => hasAttribute(grid as Element, prop))
            .map(grid => findElementNodes([grid], ['ng-template']))
            .reduce((prev, curr) => prev.concat(curr), [])
            .filter(template => hasAttribute(template as Element, 'igxToolbarCustomContent'))
            .forEach(node => {
                const { startTag, endTag, file } = getSourceOffset(node as Element);
                const replaceText = file.content.substring(startTag.start, endTag.end);
                addChange(file.url, new FileChange(startTag.start, '', replaceText, 'replace'));
            });
    }

    applyChanges();
    changes.clear();

    // General migration

    // Prepare the file changes
    for (const path of update.templateFiles) {
        findElementNodes(parseFile(new HtmlParser(), host, path), TAGS)
            .filter(grid => hasAttribute(grid as Element, prop))
            .map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { startTag, file, node } = offset;
                const { name, value } = getAttribute(node, prop)[0];
                // eslint-disable-next-line max-len
                const text = `\n<igx-grid-toolbar${makeNgIf(name, value) ? ` *ngIf="${value}"` : ''}>${moveTemplateIfAny(node)}</igx-grid-toolbar>\n`;
                addChange(file.url, new FileChange(startTag.end, text));
            });
    }

    applyChanges();
    changes.clear();

    // Remove toolbar templates after migration
    for (const path of update.templateFiles) {
        findElementNodes(parseFile(new HtmlParser(), host, path), TAGS)
            .filter(grid => hasAttribute(grid as Element, prop))
            .map(grid => findElementNodes([grid], ['ng-template']))
            .reduce((prev, curr) => prev.concat(curr), [])
            .filter(template => hasAttribute(template as Element, 'igxToolbarCustomContent'))
            .forEach(node => {
                const { startTag, endTag, file } = getSourceOffset(node as Element);
                const replaceText = file.content.substring(startTag.start, endTag.end);
                addChange(file.url, new FileChange(startTag.start, '', replaceText, 'replace'));
            });
    }

    applyChanges();

    // Remove the input properties
    update.applyChanges();
};
