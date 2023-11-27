import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { getProjects, getWorkspace } from '../common/util';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '8.2.6';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    const themes = ['$_base-dark-grid-pagination',
        '$_dark-grid-pagination',
        '$_dark-fluent-grid-pagination',
        '$_light-grid-pagination',
        '$_fluent-grid-pagination',
        '$_round-shape-grid-pagination',
        '$_default-shape-grid-pagination',
        '$_square-shape-grid-pagination'];

    const newThemes = ['$_base-dark-pagination',
    '$_dark-pagination',
    '$_dark-fluent-pagination',
    '$_light-pagination',
    '$_fluent-pagination',
    '$_round-shape-pagination',
    '$_default-shape-pagination',
    '$_square-shape-pagination'];

    const gridPaginatorComponentImport = '~igniteui-angular/lib/core/styles/components/grid-paginator/grid-paginator-component';
    const gridPaginatorThemeImport = '~igniteui-angular/lib/core/styles/components/grid-paginator/grid-paginator-theme';
    const paginatorComponentImport = '~igniteui-angular/lib/core/styles/components/paginator/paginator-component';
    const paginatorThemeImport = '~igniteui-angular/lib/core/styles/components/paginator/paginator-theme';
    const config = getWorkspace(host);
    const projects = getProjects(config);

    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const update = new UpdateChanges(__dirname, host, context);

    for (const proj of projects) {
        const dir = host.getDir(proj.sourceRoot);
        dir.visit((path, entry) => {
            if (path.endsWith('.scss')) {
                let content = entry.content.toString();
                if (content.match(/\bigx-grid-paginator\b/g)) {
                    content = content.replace(/\bigx-grid-paginator\b/g, 'igx-paginator');
                }
                themes.forEach((n, i) => {
                    if (content.indexOf(n) !== -1) {
                        content = content.split(n).join(newThemes[i]);
                    }
                });
                if (content.indexOf(gridPaginatorComponentImport) !== -1) {
                    content = content.replace(gridPaginatorComponentImport, paginatorComponentImport);
                    host.overwrite(path, content);
                }
                if (content.indexOf(gridPaginatorThemeImport) !== -1) {
                    content = content.replace(gridPaginatorThemeImport, paginatorThemeImport);
                    host.overwrite(path, content);
                }
                host.overwrite(path, content);
            }
        });
    }

    update.applyChanges();
};
