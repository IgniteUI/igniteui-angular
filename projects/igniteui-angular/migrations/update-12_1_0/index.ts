import { Element } from '@angular/compiler';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, getAttribute, getSourceOffset, hasAttribute, parseFile, serializeNodes } from '../common/util';

const version = '12.1.0';

export default (): Rule => (host: Tree, context: SchematicContext) => {
  context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

  const update = new UpdateChanges(__dirname, host, context);
  const TAGS = ['igx-grid', 'igx-tree-grid', 'igx-hierarchical-grid'];
  const prop = ['[paging]', 'paging'];
  const changes = new Map<string, FileChange[]>();
  const warnMsg = `\n<!-- Auto migrated template content. Please, check your bindings! -->\n`;

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

  const makeNgIf = (name: string, value: string) => name.startsWith('[') && value !== 'true';

  const moveTemplateIfAny = (grid, path) => {
    const paginationTemplateName = getAttribute(grid, '[paginationTemplate]')[0];
    const ngTemplates = findElementNodes(parseFile(host, path), 'ng-template');
    const paginatorTemplate = ngTemplates.filter(template => hasAttribute(template as Element, `#${paginationTemplateName.value}`))[0];
    if (paginatorTemplate) {
        return `${warnMsg}\n<igx-paginator-content>
        ${serializeNodes((paginatorTemplate as Element).children).join('')}
        </igx-paginator-content>\n`;
    }
    return '';
  };

  for (const path of update.templateFiles) {
    findElementNodes(parseFile(host, path), TAGS)
        .filter(grid => hasAttribute(grid as Element, prop))
        .map(node => getSourceOffset(node as Element))
        .forEach(offset => {
            const { startTag, file, node } = offset;
            const { name, value } = getAttribute(node, prop)[0];
            const text =
            `\n<igx-paginator${makeNgIf(name, value) ? ` *ngIf="${value}"` : ''}>${moveTemplateIfAny(node, path)}</igx-paginator>`;
            addChange(file.url, new FileChange(startTag.end, text));
        });
  }

  applyChanges();
  changes.clear();

  for (const path of update.templateFiles) {
    findElementNodes(parseFile(host, path), 'igx-row-island')
        .filter(island => hasAttribute(island as Element, prop))
        .map(island => getSourceOffset(island as Element))
        .forEach(offset => {
            const { startTag, file, node } = offset;
            const { name, value } = getAttribute(node, prop)[0];
            const text =
              `\n<igx-paginator *igxPaginator ${makeNgIf(name, value) ? ` *ngIf="${value}"` : ''}>
              ${moveTemplateIfAny(node, path)}</igx-paginator>\n`;
            addChange(file.url, new FileChange(startTag.end, text));
        });
  }

  applyChanges();
  changes.clear();

  update.applyChanges();
};
