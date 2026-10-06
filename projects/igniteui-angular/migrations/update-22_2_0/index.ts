import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import * as path from 'path';
import * as ts from 'typescript';
import { UpdateChanges } from '../common/UpdateChanges';
import { findElementNodes, getAttribute } from '../common/util';
// use bare specifier to escape the schematics encapsulation for the dynamic import:
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.cjs';
import type { Element, HtmlParser } from '@angular/compiler' with { "resolution-mode": "import" };

const version = '22.2.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const { HtmlParser } = await nativeImport('@angular/compiler');

    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();

    migrateButtonGroupMultiSelection(host, context, update, new HtmlParser());
};

/** A replacement of the `[start, end)` range of a template with `text`. */
interface TemplateChange {
    start: number;
    end: number;
    text: string;
}

// IgxButtonGroupComponent: the deprecated `multiSelection` input is replaced by `selectionMode`
const MULTI_SELECTION = ['[multiSelection]', 'multiSelection'];

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

/** Returns the changes, relative to `content`, replacing `multiSelection` on the button groups in a template. */
const getTemplateChanges = (parser: HtmlParser, content: string, url: string): TemplateChange[] =>
    findElementNodes(parser.parse(content, url).rootNodes, 'igx-buttongroup')
        .flatMap(node => getAttribute(node as Element, MULTI_SELECTION))
        .map(attr => {
            const text = getSelectionMode(attr.name, attr.value);
            let start = attr.sourceSpan.start.offset;
            // drop the whitespace separating a removed attribute from the previous one
            while (!text && start > 0 && /\s/.test(content[start - 1])) {
                start--;
            }
            return { start, end: attr.sourceSpan.end.offset, text };
        });

const applyTemplateChanges = (content: string, changes: TemplateChange[]) =>
    [...changes]
        .sort((a, b) => b.start - a.start)
        .reduce((result, c) => result.substring(0, c.start) + c.text + result.substring(c.end), content);

/** Returns the metadata object literals of the `@Component` decorators in a source file. */
const getComponentMetadata = (sourceFile: ts.SourceFile): ts.ObjectLiteralExpression[] => {
    const metadata: ts.ObjectLiteralExpression[] = [];
    const visit = (node: ts.Node) => {
        if (ts.isDecorator(node) && ts.isCallExpression(node.expression)
            && ts.isIdentifier(node.expression.expression) && node.expression.expression.text === 'Component') {
            const [arg] = node.expression.arguments;
            if (arg && ts.isObjectLiteralExpression(arg)) {
                metadata.push(arg);
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return metadata;
};

const getMetadataProperty = (metadata: ts.ObjectLiteralExpression, name: string): ts.Expression | undefined =>
    metadata.properties
        .filter(ts.isPropertyAssignment)
        .find(p => (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === name)
        ?.initializer;

const migrateButtonGroupMultiSelection = (host: Tree, context: SchematicContext, update: UpdateChanges, parser: HtmlParser) => {
    // `templateFiles` only lists `*.component.html` files, so also collect the `templateUrl` of every component
    const templateFiles = new Set(update.templateFiles);

    for (const tsPath of update.tsFiles) {
        const content = host.read(tsPath).toString();
        if (!content.includes('@Component')) {
            continue;
        }

        const sourceFile = ts.createSourceFile(tsPath, content, ts.ScriptTarget.Latest, true);
        const changes: TemplateChange[] = [];

        for (const metadata of getComponentMetadata(sourceFile)) {
            const templateUrl = getMetadataProperty(metadata, 'templateUrl');
            if (templateUrl && ts.isStringLiteralLike(templateUrl)) {
                const templatePath = path.posix.join(path.posix.dirname(tsPath), templateUrl.text);
                if (host.exists(templatePath)) {
                    templateFiles.add(templatePath);
                }
            }

            const template = getMetadataProperty(metadata, 'template');
            if (!template || !template.getText(sourceFile).includes('multiSelection')) {
                continue;
            }
            if (!ts.isStringLiteral(template) && !ts.isNoSubstitutionTemplateLiteral(template)) {
                context.logger.warn(`${tsPath}: replace the removed IgxButtonGroupComponent multiSelection input with selectionMode manually.`);
                continue;
            }

            // work on the raw source text between the quotes, so that the template offsets match the file ones
            const quote = content[template.getStart(sourceFile)];
            const start = template.getStart(sourceFile) + 1;
            const raw = content.substring(start, template.getEnd() - 1);
            for (const change of getTemplateChanges(parser, raw, tsPath)) {
                changes.push({
                    start: change.start + start,
                    end: change.end + start,
                    text: quote === '`' ? change.text : change.text.split(quote).join(`\\${quote}`)
                });
            }
        }

        if (changes.length) {
            host.overwrite(tsPath, applyTemplateChanges(content, changes));
        }
    }

    for (const templatePath of templateFiles) {
        const content = host.read(templatePath).toString();
        if (!content.includes('multiSelection')) {
            continue;
        }
        const changes = getTemplateChanges(parser, content, templatePath);
        if (changes.length) {
            host.overwrite(templatePath, applyTemplateChanges(content, changes));
        }
    }
};
