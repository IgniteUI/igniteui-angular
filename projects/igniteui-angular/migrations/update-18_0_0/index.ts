import { Rule, SchematicContext, SchematicsException, Tree } from "@angular-devkit/schematics";
import { FileChange, findElementNodes, getAttribute, getProjects, getSourceOffset, getWorkspace, hasAttribute, parseFile } from '../common/util';
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.js';
import type { Element } from '@angular/compiler';
import { BoundPropertyObject, InputPropertyType, UpdateChanges } from "../common/UpdateChanges";

const version = "18.0.0";

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`,
    );
    const { HtmlParser } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');
    const update = new UpdateChanges(__dirname, host, context);
    const changes = new Map<string, FileChange[]>();
    const prop = ["displayDensity", "[displayDensity]"];
    const tags = ["igx-grid", "igx-hierarchical-grid", "igx-row-island", "igx-tree-grid", "igx-pivot-grid",
        "igx-action-strip", "igx-button", "igx-buttongroup", "igx-chip", "igx-combo", "igx-date-picker", "igx-drop-down",
        "igx-select", "igx-input-group", "igx-list", "igx-paginator", "igx-query-builder", "igx-simple-combo", "igx-tree"];

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
        const grid = findElementNodes(parseFile(new HtmlParser(), host, path), tags);
        grid
            .filter(node => hasAttribute(node as Element, prop))
            .map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { startTag, file, node } = offset;
                const { value } = getAttribute(node, prop)[0];
                // using includes and not the value itself because the value might be either [displayDensity]='comfortable' or displayDensity="'comfortable'"
                if (value.includes('comfortable')) {
                    const newProp = ` [style.--ig-size]="'var(--ig-size-large)'"`;
                    addChange(file.url, new FileChange(startTag.end - 1, newProp, '', "insert"));
                }
                else if (value.includes('cosy')) {
                    const newProp = ` [style.--ig-size]="'var(--ig-size-medium)'"`;
                    addChange(file.url, new FileChange(startTag.end - 1, newProp, '', "insert"));
                } else if (value.includes('compact')) {
                    const newProp = ` [style.--ig-size]="'var(--ig-size-small)'"`;
                    addChange(file.url, new FileChange(startTag.end - 1, newProp, '', "insert"));
                }
                // We don`t have else because if density it set like this: [displayDensity]="customDensity"
                // then we can`t do anything and we just remove the property.
            });
    }

    update.addValueTransform('pivotConfigurationUI_to_pivotUI', (args: BoundPropertyObject): void => {
        args.bindingType = InputPropertyType.EVAL;

        switch (args.value) {
            case 'true':
                args.value = '{ showConfiguration: true }';
                break;
            case 'false':
                args.value = '{ showConfiguration: false }';
                break;
            default:
                args.value = `{ showConfiguration: ${args.value} }`;
        }
    });

    const updateMainCSSFile = (host: Tree, context: SchematicContext): Tree => {
        const workspace = getWorkspace(host);
        if (!workspace) {
            throw new SchematicsException('Could not find angular.json');
        }

        const projects = getProjects(workspace);
        for (const project of projects) {
            const srcRoot = project.sourceRoot || project.root || '';
            const stylesPath = project.architect?.build?.options?.styles
                ?.map((s) => {
                    if (typeof s === 'string') {
                        return s;
                    }
                    // ref - https://angular.dev/reference/configs/workspace-config#styles-and-scripts-configuration
                    if (typeof s === "object" && 'input' in s) {
                        return s.input as string;
                    }
                })
                .filter((s) => s?.startsWith(srcRoot))[0];

            if (!stylesPath) {
                context.logger.error(`No styles file found in angular.json for project: ${project}`);
            }

            // Read the CSS file
            const cssBuffer = host.read(stylesPath);
            if (!cssBuffer) {
                context.logger.error(`Could not find the CSS file: ${stylesPath}`);
                continue;
            }

            const content = cssBuffer.toString('utf-8');
            let newContent = `
// Specifies large size for all components to match the previous defaults
// This may not be needed for your project. Please consult https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/update-guide for more details.
:root {
    --ig-size: var(--ig-size-large);
}\n`;

            const lastUse = content.lastIndexOf('@use');
            const lastForward = content.lastIndexOf('@forward');
            if (lastUse > -1 || lastForward > -1) {
                const lastLinePos = Math.max(lastForward, lastUse);
                const fragment = content.substring(lastLinePos);
                const insertPos = fragment.indexOf(';') + lastLinePos + 1;
                newContent = content.substring(0, insertPos) + newContent + content.substring(insertPos + 1);
            } else {
                newContent = newContent + content;
            }

            // Write the new content to the CSS file
            host.overwrite(stylesPath, newContent);

            context.logger.info(`Added global default Large size for ig components to CSS file: ${stylesPath}`);
        }

        return host;
    }

    applyChanges();
    update.applyChanges();

    context.logger.info(
        `Adding global CSS rule to ensure non-specified sizes for components remain the previous default (Large).
        Please refer to the migration guide (https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/update-guide) for more information.`
    )

    updateMainCSSFile(host, context);
};
