import {
    Rule,
    SchematicContext,
    SchematicsException,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { getProjects, getWorkspace } from '../common/util';

const version = '6.0.2';

export default function(): Rule {
    return (host: Tree, context: SchematicContext) => {
        let globalStyleExt: string;
        const themeImport = '~igniteui-angular/core/styles/themes';
        const newThemeImport = '~igniteui-angular/lib/core/styles/themes';
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
                    if (content.indexOf(themeImport) !== -1) {
                        content = content.replace(themeImport, newThemeImport);
                        host.overwrite(path, content);
                    }
                }
            });
        }
    };
}
