import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, getAttribute, getSourceOffset, hasAttribute, parseFile } from '../common/util';
// use bare specifier to escape the schematics encapsulation for the dynamic import:
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.js';
import type { Element } from '@angular/compiler';

const version = '16.1.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const { HtmlParser } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');
    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();

    const prop = ['[multiSelection]'];

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

    for (const path of update.templateFiles) {
        const buttonGroups = findElementNodes(parseFile(new HtmlParser(), host, path), 'igx-buttongroup');
        buttonGroups
            .filter(node => hasAttribute(node as Element, prop))
            .map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { startTag, file, node } = offset;
                const { name, value } = getAttribute(node, prop)[0];
                const repTxt = file.content.substring(startTag.start, startTag.end);
                const property = `${name}="${value}"`;
                if (value === 'true') {
                    const removePropTxt = repTxt.replace(property, `[selectionMode]="'multi'"`);
                    addChange(file.url, new FileChange(startTag.start, removePropTxt, repTxt, 'replace'));
                } else {
                    const removePropTxt = repTxt.replace(property, '');
                    addChange(file.url, new FileChange(startTag.start, removePropTxt, repTxt, 'replace'));
                }
        });

    }

    applyChanges();
};
