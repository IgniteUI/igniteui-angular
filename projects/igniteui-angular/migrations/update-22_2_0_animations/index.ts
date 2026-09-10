import type {
    FileVisitor,
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { IG_PACKAGE_NAME, IG_LICENSED_PACKAGE_NAME } from '../common/tsUtils';

const version = '22.2.0';

const NG_ANIMATIONS = '@angular/animations';
const ANIMATIONS_ENTRY = 'animations';
const USE_ANIMATION = 'useAnimation';
const NG_METADATA_TYPE = 'AnimationReferenceMetadata';
const IGX_INPUT_TYPE = 'AnimationInput';
const PARAMS = 'params';

/** Params the presets now take in milliseconds. */
const TIME_PARAMS = new Set(['duration', 'delay']);
const MS_PER_SECOND = 1000;

interface Edit {
    start: number;
    end: number;
    text: string;
}

/** `'350ms'` -> `350`, `'.35s'` -> `350`, `` `${x}ms` `` -> `x`. Anything else is left alone. */
function toMilliseconds(node: ts.Expression, source: ts.SourceFile): string | null {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        const match = /^\s*(-?\d*\.?\d+)\s*(ms|s)\s*$/.exec(node.text);

        if (!match) {
            return null;
        }

        const value = parseFloat(match[1]);

        return String(match[2] === 's' ? value * MS_PER_SECOND : value);
    }

    if (ts.isTemplateExpression(node) && node.head.text === '' && node.templateSpans.length === 1) {
        const [span] = node.templateSpans;

        if (span.literal.text === 'ms') {
            return span.expression.getText(source);
        }
    }

    return null;
}

/** Rewrites `{ params: { ... } }` into the preset overrides object. */
function paramsText(options: ts.Expression, source: ts.SourceFile): string | null {
    if (!ts.isObjectLiteralExpression(options)) {
        return null;
    }

    const params = options.properties.find(p =>
        ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === PARAMS) as ts.PropertyAssignment | undefined;

    if (!params || !ts.isObjectLiteralExpression(params.initializer)) {
        return null;
    }

    const entries = params.initializer.properties.map(prop => {
        if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && TIME_PARAMS.has(prop.name.text)) {
            const ms = toMilliseconds(prop.initializer, source);

            if (ms !== null) {
                return `${prop.name.text}: ${ms}`;
            }
        }

        return prop.getText(source);
    });

    return `{ ${entries.join(', ')} }`;
}

function migrateFile(filePath: string, content: string, logger: SchematicContext['logger']): string {
    const source = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
    const edits: Edit[] = [];
    let ngImport: ts.ImportDeclaration | undefined;
    let useAnimationName: string | undefined;
    let metadataName: string | undefined;
    let igxAnimationsImport: ts.ImportDeclaration | undefined;
    let igxBasePackage = IG_PACKAGE_NAME;
    let needsInputType = false;

    // Pass 1: find the relevant imports.
    for (const statement of source.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
            continue;
        }

        const bindings = statement.importClause?.namedBindings;

        if (!bindings || !ts.isNamedImports(bindings)) {
            continue;
        }

        const path = statement.moduleSpecifier.text;

        if (path === NG_ANIMATIONS) {
            ngImport = statement;

            for (const element of bindings.elements) {
                const imported = (element.propertyName ?? element.name).text;

                if (imported === USE_ANIMATION) {
                    useAnimationName = element.name.text;
                }
                if (imported === NG_METADATA_TYPE) {
                    metadataName = element.name.text;
                }
            }
        }

        for (const basePackage of [IG_PACKAGE_NAME, IG_LICENSED_PACKAGE_NAME]) {
            if (path === `${basePackage}/${ANIMATIONS_ENTRY}`) {
                igxAnimationsImport = statement;
            }
            if (path.startsWith(`${basePackage}/`) || path === basePackage) {
                igxBasePackage = basePackage;
            }
        }
    }

    if (!ngImport || (!useAnimationName && !metadataName)) {
        return content;
    }

    // Pass 2: rewrite usages.
    const visit = (node: ts.Node) => {
        if (useAnimationName && ts.isCallExpression(node) && ts.isIdentifier(node.expression)
            && node.expression.text === useAnimationName && node.arguments.length > 0) {
            const [preset, options] = node.arguments;
            const presetText = preset.getText(source);
            const overrides = options ? paramsText(options, source) : null;

            if (options && overrides === null) {
                logger.warn(`  ! ${filePath}: could not migrate useAnimation options, review manually`);
                return;
            }

            edits.push({ start: node.getStart(source), end: node.getEnd(), text: overrides ? `${presetText}(${overrides})` : presetText });
            return;
        }

        if (metadataName && ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName) && node.typeName.text === metadataName) {
            needsInputType = true;
            edits.push({ start: node.typeName.getStart(source), end: node.typeName.getEnd(), text: IGX_INPUT_TYPE });
        }

        ts.forEachChild(node, visit);
    };
    visit(source);

    // Pass 3: fix the imports.
    const remaining = (ngImport.importClause!.namedBindings as ts.NamedImports).elements
        .filter(e => ![USE_ANIMATION, NG_METADATA_TYPE].includes((e.propertyName ?? e.name).text))
        .map(e => e.getText(source));
    const lineEnd = content.indexOf('\n', ngImport.getEnd());
    const importEnd = lineEnd === -1 ? content.length : lineEnd + 1;
    const replacement = remaining.length ? `import { ${remaining.join(', ')} } from '${NG_ANIMATIONS}';\n` : '';
    edits.push({ start: ngImport.getStart(source), end: importEnd, text: replacement });

    if (needsInputType) {
        if (igxAnimationsImport) {
            const bindings = igxAnimationsImport.importClause!.namedBindings as ts.NamedImports;
            const hasInput = bindings.elements.some(e => e.name.text === IGX_INPUT_TYPE);

            if (!hasInput) {
                const last = bindings.elements[bindings.elements.length - 1];
                edits.push({ start: last.getEnd(), end: last.getEnd(), text: `, ${IGX_INPUT_TYPE}` });
            }
        } else {
            edits.push({ start: importEnd, end: importEnd, text: `import { ${IGX_INPUT_TYPE} } from '${igxBasePackage}/${ANIMATIONS_ENTRY}';\n` });
        }
    }

    if (remaining.length) {
        logger.warn(`  ! ${filePath}: still imports from ${NG_ANIMATIONS}; custom animations need the igniteui-angular animation() helper`);
    }

    edits.sort((a, b) => b.start - a.start);
    let result = content;

    for (const edit of edits) {
        result = result.substring(0, edit.start) + edit.text + result.substring(edit.end);
    }

    return result;
}

export default function migrate(): Rule {
    return async (host: Tree, context: SchematicContext) => {
        context.logger.info(`Applying animations migration for Ignite UI for Angular to version ${version}`);

        const visit: FileVisitor = (filePath) => {
            if (!filePath.endsWith('.ts') || filePath.includes('node_modules') || filePath.includes('dist')) {
                return;
            }

            const content = host.read(filePath)?.toString();

            if (!content || !content.includes(NG_ANIMATIONS)) {
                return;
            }

            const migrated = migrateFile(filePath, content, context.logger);

            if (migrated !== content) {
                host.overwrite(filePath, migrated);
                context.logger.info(`  ✓ Migrated ${filePath}`);
            }
        };

        host.visit(visit);
    };
}
