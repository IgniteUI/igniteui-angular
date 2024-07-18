import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange } from '../common/util';
import * as ts from 'typescript';

const version = '18.1.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const update = new UpdateChanges(__dirname, host, context);
    const changes = new Map<string, FileChange[]>();

    const oldProp = 'shouldGenerate';
    const newProp = 'autoGenerate';

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
