import { Element } from '@angular/compiler';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import {
    FileChange,
    findElementNodes,
    getSourceOffset,
    parseFile
} from '../common/util';
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.js';

const version = '19.2.15';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`
    );

    const { HtmlParser } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');

    const update = new UpdateChanges(__dirname, host, context);
    const changes = new Map<string, FileChange[]>();
    const parser = new HtmlParser();

     const warnMsg = "Manual migration needed: please use 'disableFiltering' instead of filteringOptions.filterable." +
            "Since it has been deprecated.'";

    const applyChanges = () => {
        for (const [path, fileChanges] of changes.entries()) {
            let content = host.read(path).toString();
            fileChanges.sort((a, b) => b.position - a.position).forEach(c => {
                content = c.apply(content);
            });
            host.overwrite(path, content);
        }
    };

    const addChange = (path: string, change: FileChange) => {
        if (!changes.has(path)) {
            changes.set(path, []);
        }
        changes.get(path).push(change);
    };

    const COMBO_TAGS = ['igx-simple-combo', 'igx-combo'];

    for (const path of update.templateFiles) {
        const nodes = findElementNodes(parseFile(parser, host, path), COMBO_TAGS);

        for (const node of nodes) {
            if (!(node instanceof Element)) continue;

            const hasDisableFiltering = node.attrs.some(a => a.name.includes('disableFiltering'));
            const attr = node.attrs.find(a => a.name === '[filteringOptions]');
            if (!attr) continue;

            const attrVal = attr.value.trim();
            const offset = getSourceOffset(node);
            const file = offset.file;

            let replacementText = '';

            if (attrVal.startsWith('{')) {
                // inline object literal
                const normalized = attrVal
                    .replace(/'/g, '"')
                    .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
                const parsed = JSON.parse(normalized);
                const filterable = parsed.filterable;

                if (filterable === false && !hasDisableFiltering) {
                    replacementText += `[disableFiltering]="true"`;
                }

                const remaining = { ...parsed };
                delete remaining.filterable;
                const remainingProps = Object.entries(remaining)
                    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                    .join(', ');

                if (remainingProps.length > 0) {
                    replacementText += ` [filteringOptions]="{ ${remainingProps} }"`;
                }

                // Replace whole [filteringOptions] attribute
                const match = node.sourceSpan.toString().match(/\[filteringOptions\]="([^"]+)"/);
                if (match) {
                    const attrText = match[0];
                    const attrPos = file.content.indexOf(attrText, offset.startTag.start);
                    addChange(file.url, new FileChange(attrPos, replacementText, attrText, 'replace'));
                }
            } else {
                // log for manual TS edit
                const comment = `\n<!-- ${warnMsg} -->\n`;
                addChange(file.url, new FileChange(offset.startTag.end, comment));
            }
        }
    }

    applyChanges();

    for (const path of update.tsFiles) {
        const content = host.read(path).toString();
        const lines = content.split('\n');
        const hasDisableFiltering = lines.some(l => /\.disableFiltering\s*=/.test(l));
        const newLines: string[] = [];

        let modified = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            const directTrue = /\.filteringOptions\.filterable\s*=\s*true\s*;/.test(line);
            const directFalse = /\.filteringOptions\.filterable\s*=\s*false\s*;/.test(line);
            const negativeFlagBinding = /\.filteringOptions\.filterable\s*=\s*!\s*(.+);/.exec(line);
            const positiveFlagBinding = /\.filteringOptions\.filterable\s*=\s*(this\.\w+);/.exec(line);
            const inlineObjectAssign = /\.filteringOptions\s*=\s*{[^}]*}/.test(line);
            const filterableInObject = /filterable\s*:\s*([^,}]+)/.exec(line);
            const objectAssignment = /\.filteringOptions\s*=\s*[^;{]+;/.test(line);

            if (directTrue) {
                // Remove the line entirely
                modified = true;
                continue;
            }

            if (directFalse) {
                if (hasDisableFiltering) {
                    modified = true;
                    continue;
                }

                line = line.replace(/\.filteringOptions\.filterable\s*=\s*false\s*;/, '.disableFiltering = true;');
                modified = true;
            } else if (negativeFlagBinding) {
                 if (hasDisableFiltering) {
                    modified = true;
                    continue;
                }

                const variable = negativeFlagBinding[1].trim();
                line = line.replace(/\.filteringOptions\.filterable\s*=\s*!\s*.+;/, `.disableFiltering = ${variable};`);
                modified = true;
            } else if (positiveFlagBinding) {
                 if (hasDisableFiltering) {
                    modified = true;
                    continue;
                }

                const variable = positiveFlagBinding[1].trim();
                line = line.replace(/\.filteringOptions\.filterable\s*=\s*(this\.\w+);/, `.disableFiltering = !${variable};`);
                modified = true;
            }else if (inlineObjectAssign && filterableInObject) {
                if(hasDisableFiltering){
                    // clear object literal without adding disableFiltering
                    const cleanedLine = line
                        .replace(/filterable\s*:\s*[^,}]+,?\s*/g, '')
                        .replace(/,\s*}/, ' }')
                        .replace(/{\s*}/, '{}');

                    newLines.push(cleanedLine);
                    modified = true;
                    continue;
                }

                const filterVal = filterableInObject[1].trim();

                let disableFilteringValue: string;
                if (filterVal === 'true') {
                    disableFilteringValue = 'false';
                } else if (filterVal === 'false') {
                    disableFilteringValue = 'true';
                } else if (filterVal.startsWith('!')) {
                    disableFilteringValue = filterVal.slice(1).trim();
                } else {
                    disableFilteringValue = `!${filterVal}`;
                }

                const cleanedLine = line
                    .replace(/filterable\s*:\s*[^,}]+,?\s*/g, '')
                    .replace(/,\s*}/, ' }')
                    .replace(/{\s*}/, '{}');

                // Output both lines
                newLines.push(line.replace(/\.filteringOptions\s*=.*/, `.disableFiltering = ${disableFilteringValue};`));
                newLines.push(cleanedLine);
                modified = true;
                continue;
            } else if (objectAssignment) {
                newLines.push('// '+ warnMsg);
                modified = true;
            }
            newLines.push(line);
        }

        if (modified) {
            host.overwrite(path, newLines.join('\n'));
        }
    }

    update.applyChanges();
};
