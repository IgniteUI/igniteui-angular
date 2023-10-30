import {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, getAttribute, getSourceOffset, hasAttribute, parseFile } from '../common/util';
import { nativeImport } from '../common/import-helper.js';
import { Element } from '@angular/compiler';

const version = '17.0.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const { HtmlParser } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');
    const update = new UpdateChanges(__dirname, host, context);
    const changes = new Map<string, FileChange[]>();
    const prop = ['type'];
    const elevated = ['elevated'];

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
        const cardComponents = findElementNodes(parseFile(new HtmlParser(), host, path), 'igx-card');
        cardComponents
            .filter(node => hasAttribute(node as Element, prop) && !hasAttribute(node as Element, elevated))
            .map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { startTag, file, node } = offset;
                const { name, value } = getAttribute(node, prop)[0];
                const repTxt = file.content.substring(startTag.start, startTag.end - 1);
                const property = `${name}="${value}"`;
                if (value === 'outlined') {
                    const removePropTxt = repTxt.replace(property, '').trimEnd();
                    addChange(file.url, new FileChange(startTag.start, removePropTxt, repTxt, 'replace'));
                } else {
                    const removePropTxt = repTxt.replace(property, `elevated`);
                    addChange(file.url, new FileChange(startTag.start, removePropTxt, repTxt, 'replace'));
                }
        });

        cardComponents
            .filter(node => !hasAttribute(node as Element, prop) && !hasAttribute(node as Element, elevated))
            .map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { startTag, file } = offset;
                const repTxt = file.content.substring(startTag.start, startTag.end - 1);
                const removePropTxt = repTxt.concat(' ', `elevated`);
                addChange(file.url, new FileChange(startTag.start, removePropTxt, repTxt, 'replace'));
            });
    }

    applyChanges();
    update.applyChanges();
};
