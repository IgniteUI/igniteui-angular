import { Element } from '@angular/compiler';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, generateFileChange, getSourceOffset, parseFile } from '../common/util';

const version = '11.0.0';

export default function (): Rule {
    return (host: Tree, context: SchematicContext) => {
        context.logger.info(
            `Applying migration for Ignite UI for Angular to version ${version}`
        );

        const update = new UpdateChanges(__dirname, host, context);

        const TAGS = ['igx-grid', 'igx-tree-grid', 'igx-hierarchical-grid'];

        const files = new Set<string>();
        const changes = new Map<string, FileChange[]>();


        /**
         * This condition callback clears the input property for the toolbar
         * and collects the template files which will be modified.
         */
        const gather_files = (matchedOwner: string, path: string): boolean => {
            if (!matchedOwner) {
                return;
            }
            files.add(path);

            return true;
        };

        // Add the condition and migrate the inputs
        update.addCondition('migrate_toolbar', gather_files);
        update.applyChanges();

        // Prepare file changes
        for (const path of files) {
            findElementNodes(parseFile(host, path), TAGS)
                .map(node => getSourceOffset(node as Element))
                .forEach(offset => {
                    const { startTag, file } = offset;
                    const text = `\n<igx-grid-toolbar></igx-grid-toolbar>\n`;
                    const change = generateFileChange(startTag, text);
                    changes.has(file.url) ? changes.get(file.url).push(change) : changes.set(file.url, [change]);
                });
        }

        // Apply them
        for (const [path, change] of changes.entries()) {
            let delta = 0;
            let buffer = host.read(path).toString();

            for (const [start, text, len] of change) {
                buffer = `${buffer.substring(0, start + delta)}${text}${buffer.substring(start + delta)}`;
                delta += len;
            }

            host.overwrite(path, buffer);
        }
    };
}
