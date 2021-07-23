import { Element } from '@angular/compiler';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, getAttribute, getSourceOffset, hasAttribute, parseFile,
        serializeNodes, makeNgIf, stringifyAttriutes } from '../common/util';
import { findMatches, replaceMatch } from '../common/tsUtils';

const version = '12.1.0';

export default (): Rule => (host: Tree, context: SchematicContext) => {
  context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

  const update = new UpdateChanges(__dirname, host, context);
  const TAGS = ['igx-grid', 'igx-tree-grid', 'igx-hierarchical-grid'];
  const prop = ['[paging]', 'paging'];
  const changes = new Map<string, FileChange[]>();
  const warnMsg = `\n<!-- Auto migrated template content. Please, check your bindings! -->\n`;
  const templateNames = [];

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

  const checkForPaginatorInTemplate = (path, name) => {
    const ngTemplates = findElementNodes(parseFile(host, path), 'ng-template');
    const paginatorTemplate = ngTemplates.filter(template => hasAttribute(template as Element, `#${name}`))[0];
    return paginatorTemplate ? !!findElementNodes((paginatorTemplate as Element).children, 'igx-paginator').length : false;
  };

  const moveTemplate = (paginatorTemplate) => {
    if (paginatorTemplate) {
      return `${warnMsg}\n<igx-paginator-content>
      ${serializeNodes((paginatorTemplate as Element).children).join('')}
      </igx-paginator-content>\n`;
    }
    return '';
  };

  const buildPaginator = (node, path, propName, value, isChildGrid = false) => {
    const paginationTemplateName = getAttribute(node, '[paginationTemplate]')[0];
    const ngTemplates = findElementNodes(parseFile(host, path), 'ng-template');
    templateNames.push('#' + paginationTemplateName?.value);
    const paginatorTemplate = ngTemplates.filter(template => hasAttribute(template as Element, `#${paginationTemplateName?.value}`))[0];
    if (paginatorTemplate && checkForPaginatorInTemplate(path, paginationTemplateName?.value)) {
      const pgCmpt = findElementNodes((paginatorTemplate as Element).children, 'igx-paginator')[0];
      return `\n<igx-paginator${isChildGrid ? ' *igxPaginator' : ''}${stringifyAttriutes((pgCmpt as Element).attrs)}></igx-paginator>`;
    } else {
      // eslint-disable-next-line max-len
      return `\n<igx-paginator${isChildGrid ? ' *igxPaginator' : ''}${makeNgIf(propName, value) ? ` *ngIf="${value}"` : ''}>${moveTemplate(paginatorTemplate)}</igx-paginator>`;
    }
  };

    const cellChanges= [
        { member: 'rowIndex', replaceWith: 'row.index', definedIn: ['IgxGridCell'] },
        { member: 'columnIndex', replaceWith: 'column.index', definedIn: ['IgxGridCellComponent'] },
        { member: 'visibleColumnIndex', replaceWith: 'column.visibleIndex.index', definedIn: ['IgxGridCellComponent'] },
    ];

    for (const entryPath of update.tsFiles) {
        const ls = update.getDefaultLanguageService(entryPath);
        let content = host.read(entryPath).toString();
        for (const change of cellChanges) {
            const matches = findMatches(content, change.member);
            for (const position of matches) {
                const definition = ls.getDefinitionAndBoundSpan(entryPath, position - 1)?.definitions[0];
                if (definition
                    && definition.kind === 'class'
                    && (definition.name === 'IgxGridCell' || definition.name === 'CellType')
                    && definition.fileName.includes('igniteui-angular')) {
                    content = replaceMatch(content, change.member, change.replaceWith, position);
                    host.overwrite(entryPath, content);
                }
            }
        }
    }

  applyChanges();
  changes.clear();

  // migrate paging and pagination template for grid, tree grid and hierarchical grid
  for (const path of update.templateFiles) {
    findElementNodes(parseFile(host, path), TAGS)
      .filter(grid => hasAttribute(grid as Element, prop))
      .map(node => getSourceOffset(node as Element))
      .forEach(offset => {
        const { startTag, file, node } = offset;
        const { name, value } = getAttribute(node, prop)[0];
        const text = buildPaginator(node, path, name, value);
        addChange(file.url, new FileChange(startTag.end, text));
      });
  }

  applyChanges();
  changes.clear();

  // apply the migrations to the rowIsland
  for (const path of update.templateFiles) {
    findElementNodes(parseFile(host, path), 'igx-row-island')
      .filter(island => hasAttribute(island as Element, prop))
      .map(island => getSourceOffset(island as Element))
      .forEach(offset => {
        const { startTag, file, node } = offset;
        const { name, value } = getAttribute(node, prop)[0];
        const text = buildPaginator(node, path, name, value, true);
        addChange(file.url, new FileChange(startTag.end, text));
      });
  }

  applyChanges();
  changes.clear();

  // clear paginationTemplate definitions
  for (const path of update.templateFiles) {
    findElementNodes(parseFile(host, path), 'ng-template')
      .filter(template => hasAttribute(template as Element, templateNames))
      .forEach(node => {
        const { startTag, endTag, file } = getSourceOffset(node as Element);
        const replaceText = file.content.substring(startTag.start, endTag.end);
        addChange(file.url, new FileChange(startTag.start, '', replaceText, 'replace'));
      });
  }

  applyChanges();
  changes.clear();

  update.applyChanges();
};
