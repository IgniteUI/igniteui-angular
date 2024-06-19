import {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, getAttribute, getSourceOffset, hasAttribute, parseFile } from '../common/util';
// use bare specifier to escape the schematics encapsulation for the dynamic import:
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.js';
import { Element } from '@angular/compiler';

const version = '17.1.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const { HtmlParser } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');
    const update = new UpdateChanges(__dirname, host, context);
    const changes = new Map<string, FileChange[]>();
    const tags = ['button', 'span', 'a', 'div', 'igx-prefix', 'igx-suffix']
    const type = ['igxButton'];

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
        const components = findElementNodes(parseFile(new HtmlParser(), host, path), tags);
        components
          .filter(node => hasAttribute(node as Element, type))
          .map(node => getSourceOffset(node as Element))
          .forEach(offset => {
            const { startTag, file, node } = offset;
            const { name, value } = getAttribute(node, type)[0];
            const repTxt = file.content.substring(startTag.start, startTag.end - 1);
            const btn = `${name}="${value}"`;
            const iconBtn = `igxIconButton="flat"`
            if (value === 'raised') {
                const renameType = repTxt.replace(`raised`, `contained`);
                addChange(file.url, new FileChange(startTag.start, renameType, repTxt, 'replace'));
            } else if (value === 'icon') {
                const removePropTxt = repTxt.replace(btn, iconBtn);
                addChange(file.url, new FileChange(startTag.start, removePropTxt, repTxt, 'replace'));
            }
        });
    }

    applyChanges();
    update.applyChanges();
};
