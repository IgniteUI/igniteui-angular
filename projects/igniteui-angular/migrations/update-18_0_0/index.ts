import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, getAttribute, getSourceOffset, hasAttribute, parseFile } from '../common/util';
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.js';
import type { Element } from '@angular/compiler';

const version = "18.0.0";

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`,
    );
    const { HtmlParser } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');
    const update = new UpdateChanges(__dirname, host, context);
    const changes = new Map<string, FileChange[]>();
    const prop = ["displayDensity", "[displayDensity]"];
    const tags = ["igx-grid", "igx-hierarchical-grid", "igx-row-island", "igx-tree-grid", "igx-pivot-grid"]

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

    for (const path of update.templateFiles) {
        const grid = findElementNodes(parseFile(new HtmlParser(), host, path), tags);
        grid
            .filter(node => hasAttribute(node as Element, prop))
            .map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { startTag, file, node } = offset;
                const { value } = getAttribute(node, prop)[0];
                // using includes and not the value itself because the value might be either [displayDensity]='comfortable' or displayDensity="'comfortable'"
                if (value.includes('comfortable')) {
                    const newProp = ` [style.--ig-size]="'var(--ig-size-large)'"`;
                    addChange(file.url, new FileChange(startTag.end - 1, newProp, '', "insert"));
                }
                else if (value.includes('cosy')) {
                    const newProp = ` [style.--ig-size]="'var(--ig-size-medium)'"`;
                    addChange(file.url, new FileChange(startTag.end - 1, newProp, '', "insert"));
                } else if (value.includes('compact')) {
                    const newProp = ` [style.--ig-size]="'var(--ig-size-small)'"`;
                    addChange(file.url, new FileChange(startTag.end - 1, newProp, '', "insert"));
                }
                // We don`t have else because if density it set like this: [displayDensity]="customDensity"
                // then we can`t do anything and we just remove the property.
        });
    }
    applyChanges();

    update.applyChanges();
};
