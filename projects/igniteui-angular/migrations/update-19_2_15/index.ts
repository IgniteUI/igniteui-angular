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

  const { HtmlParser } = (await nativeImport('@angular/compiler')) as typeof import('@angular/compiler');

  const update = new UpdateChanges(__dirname, host, context);
  const changes = new Map<string, FileChange[]>();
  const parser = new HtmlParser();

  const warnMsg = "Manual migration needed: please use 'disableFiltering' instead of filteringOptions.filterable. " +
    "Since it has been deprecated.";

  const applyChanges = () => {
    for (const [path, fileChanges] of changes.entries()) {
      let content = host.read(path)!.toString();
      fileChanges
        .sort((a, b) => b.position - a.position)
        .forEach((c) => {
          content = c.apply(content);
        });
      host.overwrite(path, content);
    }
  };

  const addChange = (path: string, change: FileChange) => {
    if (!changes.has(path)) {
      changes.set(path, []);
    }
    changes.get(path)!.push(change);
  };

  const COMBO_TAGS = ['igx-simple-combo', 'igx-combo'];

  for (const path of update.templateFiles) {
    const root = parseFile(parser, host, path);
    const nodes = findElementNodes(root, COMBO_TAGS);

    for (const node of nodes) {
        if (!(node instanceof Element)) continue;

        const hasDisableFiltering = node.attrs.some(a => a.name.includes('disableFiltering'));
        const attr = node.attrs.find(a => a.name === '[filteringOptions]');
        if (!attr) continue;

        const offset = getSourceOffset(node);
        const file = offset.file;
        const attrVal = (attr.value || '').trim();

        // Handle inline object literals like [filteringOptions]="{...}"
        if (attrVal.startsWith('{') && attrVal.endsWith('}')) {
            const inner = attrVal.slice(1, -1);
            let willDisableFiltering = false;

            let remainingInner = inner.replace(
                /(^|,)\s*filterable\s*:\s*(true|false)\s*(?=,|$)/i,
                (_m, leading, val) => {
                    if (/^false$/i.test(val) && !hasDisableFiltering) {
                        willDisableFiltering = true;
                    }
                    return leading ? leading : '';
                }
            );

            remainingInner = remainingInner
                .replace(/\s*,\s*,\s*/g, ',')
                .replace(/^\s*,\s*|\s*,\s*$/g, '')
                .trim();

            let replacementText = '';
            if (willDisableFiltering) {
                replacementText += `[disableFiltering]="true"`;
            }
            if (remainingInner.length > 0) {
                replacementText += ` [filteringOptions]="{ ${remainingInner} }"`;
            }
            replacementText = replacementText.trim();

            const attrStart = (attr as any).sourceSpan.start.offset as number;
            const attrEnd = (attr as any).sourceSpan.end.offset as number;
            const original = file.content.slice(attrStart, attrEnd);
            addChange(file.url, new FileChange(attrStart, replacementText, original, 'replace'));

        } else if (attrVal.length > 0) {
            // log for manual TS edit
            const comment = `\n<!-- ${warnMsg} -->\n`;
            addChange(file.url, new FileChange(offset.startTag.end, comment));
        }
    }
  }

  applyChanges();

  for (const path of update.tsFiles) {
    const buf = host.read(path);
    if (!buf) continue;

    const content = buf.toString();
    const lines = content.split('\n');
    const newLines: string[] = [];

    let modified = false;

    for (const line of lines) {
      if (
        /\.\s*filteringOptions\s*\.\s*filterable\s*=/.test(line) ||
        /\.\s*filteringOptions\s*=\s*{/.test(line)
      ) {
        newLines.push(`// ${warnMsg}`);
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
