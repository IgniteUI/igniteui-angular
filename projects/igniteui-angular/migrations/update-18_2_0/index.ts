import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange } from '../common/util';

const version = '18.2.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const update = new UpdateChanges(__dirname, host, context);
    const changes = new Map<string, FileChange[]>();

    const oldProp = 'shouldGenerate';
    const newProp = 'autoGenerate';

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

    const addChange = (path: string, change: FileChange) => {
        if (changes.has(path)) {
            changes.get(path).push(change);
        } else {
            changes.set(path, [change]);
        }
    };

    const applyChanges = () => {
        for (const [path, fileChanges] of changes.entries()) {
            let content = host.read(path).toString();
            fileChanges.sort((a, b) => b.position - a.position).forEach(change => {
                content = change.apply(content);
            });
            host.overwrite(path, content);
        }
    };

    const visitNode = (node: ts.Node, sourceFile: ts.SourceFile) => {
        if (ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.name) &&
            node.name.text === oldProp) {
            const start = node.name.getStart(sourceFile);
            const end = node.name.getEnd();
            addChange(sourceFile.fileName, new FileChange(start, newProp, oldProp, 'replace'));
        }

        ts.forEachChild(node, child => visitNode(child, sourceFile));
    };

    for (const path of update.tsFiles) {
        const content = host.read(path).toString();
        const sourceFile = ts.createSourceFile(
            path,
            content,
            ts.ScriptTarget.Latest,
            true
        );

        visitNode(sourceFile, sourceFile);
    }

    applyChanges();
    update.applyChanges();
};
