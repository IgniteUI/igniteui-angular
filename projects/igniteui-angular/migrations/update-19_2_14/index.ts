import { Element } from '@angular/compiler';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import {
    FileChange,
    findElementNodes,
    getSourceOffset,
    parseFile
} from '../common/util';
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.js';

const version = '19.2.14';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`
    );

    const { HtmlParser } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');

    const update = new UpdateChanges(__dirname, host, context);
    const changes = new Map<string, FileChange[]>();
    const parser = new HtmlParser();

    const warnMsg = "Manual migration needed: please use 'disableFiltering' instead of filteringOptions.filterable." +
     "If you were using filteringOptions please include them without 'filterable'";

    const applyChanges = () => {
        for (const [path, fileChanges] of changes.entries()) {
            let content = host.read(path).toString();
            fileChanges.sort((a, b) => b.position - a.position).forEach(c => {
                content = c.apply(content);
            });
            host.overwrite(path, content);
        }
    };

    const addChange = (path: string, change: FileChange) => {
        if (!changes.has(path)) {
            changes.set(path, []);
        }
        changes.get(path).push(change);
    };

    const COMBO_TAG = 'igx-simple-combo';

    for (const path of update.templateFiles) {
        const nodes = findElementNodes(parseFile(parser, host, path), COMBO_TAG);

        for (const node of nodes) {
            if (!(node instanceof Element)) continue;

            const attr = node.attrs.find(a => a.name === '[filteringOptions]');
            if (!attr) continue;

            const attrVal = attr.value.trim();
            const offset = getSourceOffset(node);
            const file = offset.file;

            let replacementText = '';

            if (attrVal.startsWith('{')) {
                // inline object literal
                const parsed = eval('(' + attrVal + ')');
                const filterable = parsed.filterable;

                if (typeof filterable === 'boolean') {
                    replacementText += `[disableFiltering]="${!filterable}"`;
                }

                const remaining = { ...parsed };
                delete remaining.filterable;
                const remainingProps = Object.entries(remaining)
                    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                    .join(', ');

                if (remainingProps.length > 0) {
                    replacementText += ` [filteringOptions]="{ ${remainingProps} }"`;
                }

                // Replace whole [filteringOptions] attribute
                const match = node.sourceSpan.toString().match(/\[filteringOptions\]="([^"]+)"/);
                if (match) {
                    const attrText = match[0];
                    const attrPos = file.content.indexOf(attrText, offset.startTag.start);
                    addChange(file.url, new FileChange(attrPos, replacementText, attrText, 'replace'));
                }
            } else {
                // log for manual TS edit
                const attrText = `[filteringOptions]="${attrVal}"`;
                const attrPos = file.content.indexOf(attrText, offset.startTag.start);

                addChange(file.url, new FileChange(attrPos, '', attrText, 'replace'));
                addChange(file.url, new FileChange(offset.startTag.end, warnMsg));
            }
        }
    }

    applyChanges();

    update.applyChanges();
};
