import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";
import { UpdateChanges } from "../common/UpdateChanges";
import { FileChange, findElementNodes, getAttribute, getSourceOffset, hasAttribute, parseFile } from '../common/util';
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.js';
import { Element } from '@angular/compiler';

const version = "18.1.0";

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`,
    );
    const { HtmlParser } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');
    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();

    const prop = ['[filteringOptions]'];
    const tags = ['igx-combo', 'igx-simple-combo'];
    const changes = new Map<string, FileChange[]>();
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
        const components = findElementNodes(parseFile(new HtmlParser(), host, path), tags);
        components
            .filter(node => hasAttribute(node as Element, prop))
            .map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { startTag, file, node } = offset;
                const { name, value } = getAttribute(node, prop)[0];
                const repTxt = file.content.substring(startTag.start, startTag.end);
                const property = `${name}="${value}"`;
                const pattern = /(\{|\s*,)\s*filterable:\s*[^,\s*}]+(?=\s*,|\s*\})/g;

                let newValue = value.replace(pattern, (match, p1) => p1 === '{' ? '{' : '');
                newValue = newValue.replace(/\{\s*,/, '{').replace(/,\s*\}/, '}');
                let newProperty = '';
                if (newValue !== '{ }') {
                    newProperty = `${name}="${newValue}"`;
                }
                const removePropTxt = repTxt.replace(property, newProperty);
                addChange(file.url, new FileChange(startTag.start, removePropTxt, repTxt, 'replace'));
            });

    }

    for(const path of update.tsFiles){
        let content = host.read(path).toString();
        const pattern = /IComboFilteringOptions\s*=\s*{[^}]*}/g;
        let match;
        while(match = pattern.exec(content)){
            let newMatch = match[0].replace(/(\{|\s*,)\s*filterable:\s*[^,\s*}]+(?=\s*,|\s*\})/g, (match, p1) => p1 === '{' ? '{' : '');
            newMatch = newMatch.replace(/\{\s*,/, '{').replace(/,\s*\}/, '}');
            content = content.replace(match[0], newMatch);
        }
        host.overwrite(path, content);
    }
    applyChanges();
};
