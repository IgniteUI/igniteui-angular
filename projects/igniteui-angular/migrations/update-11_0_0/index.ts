import { Element } from '@angular/compiler';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, generateFileChange, getAttribute, getSourceOffset, hasAttribute, parseFile } from '../common/util';

const version = '11.0.0';

export default function (): Rule {
    return (host: Tree, context: SchematicContext) => {
        context.logger.info(
            `Applying migration for Ignite UI for Angular to version ${version}`
        );

        const update = new UpdateChanges(__dirname, host, context);

        const TAGS = ['igx-grid', 'igx-tree-grid', 'igx-hierarchical-grid'];
        const prop = ['[showToolbar]', 'showToolbar'];
        const changes = new Map<string, FileChange[]>();


        const makeNgIf = (name: string, value: string) => {
            return name.startsWith('[') && value !== 'true';
        };

        // Prepare the file changes
        for (const path of update.templateFiles) {
            findElementNodes(parseFile(host, path), TAGS)
                .filter(grid => hasAttribute(grid as Element, prop))
                .map(node => getSourceOffset(node as Element))
                .forEach(offset => {
                    const { startTag, file, node } = offset;
                    const { name, value } = getAttribute(node, prop)[0];
                    const text = `\n<igx-grid-toolbar ${makeNgIf(name, value) ? `*ngIf="${value}"` : ''}></igx-grid-toolbar>\n`;
                    const change = generateFileChange(startTag, text);
                    changes.has(file.url) ? changes.get(file.url).push(change) : changes.set(file.url, [change]);
                });
        }

        // Apply them
        for (let [path, change] of changes.entries()) {

            let buffer = host.read(path).toString();
            change = change.sort((c, c1) => c.position - c1.position).reverse();

            for (const { position, text } of change) {
                buffer = `${buffer.substring(0, position)}${text}${buffer.substring(position)}`;
            }

            host.overwrite(path, buffer);
        }

        // Remove the input properties
        update.applyChanges();
    };
}
