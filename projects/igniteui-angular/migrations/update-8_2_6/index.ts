import {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { getProjects, getWorkspace } from '../common/util';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '8.2.6';

export default function(): Rule {
    return (host: Tree, context: SchematicContext) => {
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

        let globalStyleExt: string;
        const config = getWorkspace(host);
        const projects = getProjects(config);

        context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

        if (config.schematics && config.schematics['@schematics/angular:component']) {
            // updated projects have global prefix rather than per-project:
            globalStyleExt = config.schematics['@schematics/angular:component'].styleext;
        }

        for (const proj of projects) {
            const dir = host.getDir(proj.sourceRoot);
            let ext = globalStyleExt || 'scss';
            if (proj.schematics && proj.schematics['@schematics/angular:component']) {
                ext = proj.schematics['@schematics/angular:component'].styleext || ext;
            }
            dir.visit((path, entry) => {
                if (path.endsWith('.' + ext)) {
                    let content = entry.content.toString();
                    if (content.match(/\bigx-grid-paginator\b/g)) {
                        content = content.replace(/\bigx-grid-paginator\b/g, 'igx-paginator');
                    }
                    themes.forEach((n, i) => {
                        if (content.indexOf(n) !== -1) {
                            content = content.split(n).join(newThemes[i]);
                        }
                    });
                    host.overwrite(path, content);
                }
            });
        }

        const update = new UpdateChanges(__dirname, host, context);
        update.applyChanges();
    };
}
