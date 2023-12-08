import type {
  Rule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import type { Element } from '@angular/compiler';
// use bare specifier to escape the schematics encapsulation for the dynamic import:
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.js';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, getAttribute, getSourceOffset, hasAttribute, parseFile } from '../common/util';

const version = '13.1.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
  context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
  const { HtmlParser } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');

  const update = new UpdateChanges(__dirname, host, context);
  const GRID_TAGS = ['igx-grid', 'igx-tree-grid', 'igx-hierarchical-grid', 'igx-row-island'];
  const prop = ['[movable]'];
  const changes = new Map<string, FileChange[]>();

  const gridsToMigrate = new Set<any>();

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

  const getMovingColumns = (parent: Element, columns: any[]) => {
    const movingNestedGroup = parent.children.filter(column => (column as Element).name === 'igx-column-group');
    const movingColumns = parent.children.filter(column => (column as Element).name === 'igx-column' && hasAttribute(column as Element, prop));
    columns.push(...movingColumns);
    movingNestedGroup.forEach(group => {
      if (hasAttribute(group as Element, prop)) {
        columns.push(group);
      }
      getMovingColumns(group as Element, columns);
    });
  }

  // migrate movable on column-level to moving on grid-level for grid, tree grid, hierarchical grid and row island
  for (const path of update.templateFiles) {
    gridsToMigrate.clear();
    const grids = findElementNodes(parseFile(new HtmlParser(), host, path), GRID_TAGS);
    grids.forEach(grid => {
      const grid_elem = grid as Element;
      const columns: any[] = [];
      getMovingColumns(grid_elem, columns);

      columns.map(node => getSourceOffset(node as Element))
        .forEach(offset => {
          const { startTag, file, node } = offset;
          const { name, value } = getAttribute(node, prop)[0];
          if (value === 'true') {
            gridsToMigrate.add(grid_elem);
          }
          const repTxt = file.content.substring(startTag.start, startTag.end);
          const property = `${name}="${value}"`;
          const removePropTxt = repTxt.replace(property, '');
          addChange(file.url, new FileChange(startTag.start, removePropTxt, repTxt, 'replace'));
        });
    });

    Array.from(gridsToMigrate).map(node => getSourceOffset(node as Element)).forEach(offset => {
      const { startTag, file } = offset;
      addChange(file.url, new FileChange(startTag.end - 1, ' [moving]="true"'));
    });
  }

  const _import = new RegExp(`@import ('|")~igniteui-angular\/lib\/core\/styles\/themes\/index('|");`, 'g');
  for (const path of update.sassFiles) {
    const fileContent = host.read(path).toString();
    const replacedString =
`/* Line added via automated migrations. */
@use "igniteui-angular/theming" as *;
` + fileContent.replace(_import, '');
    if (_import.test(fileContent)) {
      host.overwrite(path, replacedString);
    }
  }
  applyChanges();
  update.applyChanges();
  changes.clear();
};
