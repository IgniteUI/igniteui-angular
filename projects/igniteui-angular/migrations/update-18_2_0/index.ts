import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { BoundPropertyObject, InputPropertyType, UpdateChanges } from '../common/UpdateChanges';
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.js';
import { FileChange, findElementNodes, getAttribute, getSourceOffset, hasAttribute, parseFile } from '../common/util';
import { Element } from '@angular/compiler';

const version = '18.2.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const update = new UpdateChanges(__dirname, host, context);

    const { HtmlParser } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');
    const changes = new Map<string, FileChange[]>();
    const prop = ['[filteringOptions]'];
    const tags = ['igx-combo', 'igx-simple-combo'];

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

    const IG_COLORS = [
        'primary-',
        'primary-A',
        'secondary-',
        'secondary-A',
        'gray-',
        'surface-',
        'surface-A',
        'info-',
        'info-A',
        'success-',
        'success-A',
        'warn-',
        'warn-A',
        'error-',
        'error-A'
    ];

    const hslaColor = 'hsla?\\(var\\(--ig-attr(\\d)00\\)\\)';

    for (const entryPath of update.sassFiles) {
        let content = host.read(entryPath).toString();
        IG_COLORS.forEach(color => {
            let prop = hslaColor.replace('attr', color);
            const regex = new RegExp(prop, 'g');
            if (regex.test(content)) {
                let newColor = prop.replace(/hsla\?\\\(var\\\(--ig-/g, 'var\(--ig-');
                newColor = newColor.replace('(\\d)', '$1');
                newColor = newColor.replace('\\)\\)', ')');
                content = content.replace(regex, newColor);
                host.overwrite(entryPath, content);
            }
        });
    }

    update.addValueTransform('filterable_to_disableFiltering', (args: BoundPropertyObject): void => {
        args.bindingType = InputPropertyType.STRING;

        switch (args.value) {
            case 'true':
                args.value = 'false';
                break;
            case 'false':
                args.value = 'true';
                break;
            default:
                args.value += ` ? 'false' : 'true' `;
        }
    });

    for (const path of update.tsFiles) {
        let content = host.read(path).toString();
        const pattern = /IComboFilteringOptions\s*=\s*{[^}]*}/g;
        let match;
        while (match = pattern.exec(content)) {
            let newMatch = match[0].replace(/(\{|\s*,)\s*filterable:\s*true(?=\s*,|\s*\})/g, (match, p1) => p1 === '{' ? '{' : '');
            newMatch = newMatch.replace(/\{\s*,/, '{').replace(/,\s*\}/, '}');
            content = content.replace(match[0], newMatch);
        }

        const filterableMatch = /(filterable\s*(?::|=)\s*false)[^\n]*/g;
        content = content.replace(filterableMatch, match => {
            return `${match} // TODO: Replace with disableFiltering`;
        });
        host.overwrite(path, content);
    }

    for (const path of update.templateFiles) {
        const components = findElementNodes(parseFile(new HtmlParser(), host, path), tags);
        components
            .filter(node => hasAttribute(node as Element, prop))
            .map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { startTag, file, node } = offset;
                const { name, value } = getAttribute(node, prop)[0];
                const repTxt = file.content.substring(startTag.start, startTag.end);
                const property = `${name}="${value}"`;
                const filteringOptions = JSON.parse(value.replace(/(\w+)\s*:/g, '"$1":').replace(/:\s*(\w+)/g, ': "$1"'));
                let disableFiltering = '';
                if (filteringOptions.hasOwnProperty("filterable") && node.name === 'igx-combo' && filteringOptions.filterable !== 'true') {
                    disableFiltering = `[disableFiltering]="!${filteringOptions.filterable}"`;
                }
                delete filteringOptions.filterable;
                let newValue = JSON.stringify(filteringOptions).replace(/"/g, '');
                let newProperties = `${disableFiltering}`;
                if (newValue !== '{}') {
                    newProperties = `${name}="${newValue}" ${disableFiltering}`;
                }
                const removePropTxt = repTxt.replace(property, newProperties);
                addChange(file.url, new FileChange(startTag.start, removePropTxt, repTxt, 'replace'));
            });
    }

    applyChanges();
    update.applyChanges();
};

