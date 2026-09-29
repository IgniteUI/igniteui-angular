import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, getAttribute, parseFile } from '../common/util';
// use bare specifier to escape the schematics encapsulation for the dynamic import:
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.cjs';
import type { Element } from '@angular/compiler' with { "resolution-mode": "import" };

const version = '22.2.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const { HtmlParser } = await nativeImport('@angular/compiler');

    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();

    // IgxButtonGroupComponent: the deprecated `multiSelection` input is replaced by `selectionMode`
    const multiSelection = ['[multiSelection]', 'multiSelection'];
    const changes = new Map<string, FileChange[]>();

    const getSelectionMode = (name: string, value: string) => {
        const expression = value.trim();
        if (name === 'multiSelection') {
            return expression === 'true' ? `selectionMode="multi"` : '';
        }
        if (expression === 'true') {
            return `[selectionMode]="'multi'"`;
        }
        if (expression === 'false' || !expression) {
            return '';
        }
        return `[selectionMode]="(${expression}) ? 'multi' : 'single'"`;
    };

    for (const path of update.templateFiles) {
        findElementNodes(parseFile(new HtmlParser(), host, path), 'igx-buttongroup')
            .flatMap(node => getAttribute(node as Element, multiSelection))
            .forEach(attr => {
                const { start, end } = attr.sourceSpan;
                const content = start.file.content;
                const replacement = getSelectionMode(attr.name, attr.value);
                let position = start.offset;
                // drop the whitespace separating a removed attribute from the previous one
                while (!replacement && position > 0 && /\s/.test(content[position - 1])) {
                    position--;
                }
                const change = new FileChange(position, replacement, content.substring(position, end.offset), 'replace');
                changes.set(path, [...(changes.get(path) ?? []), change]);
            });
    }

    for (const [path, fileChanges] of changes) {
        let buffer = host.read(path).toString();
        fileChanges
            .sort((a, b) => b.position - a.position)
            .forEach(c => buffer = c.apply(buffer));
        host.overwrite(path, buffer);
    }
};
