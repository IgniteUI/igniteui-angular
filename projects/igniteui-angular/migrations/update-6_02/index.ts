import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { getProjects, getWorkspace } from '../common/util';

const version = '6.0.2';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    const themeImport = '~igniteui-angular/core/styles/themes';
    const newThemeImport = '~igniteui-angular/lib/core/styles/themes';
    const config = getWorkspace(host);
    const projects = getProjects(config);

    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    for (const proj of projects) {
        const dir = host.getDir(proj.sourceRoot);
        dir.visit((path, entry) => {
            if (path.endsWith('.scss')) {
                let content = entry.content.toString();
                if (content.indexOf(themeImport) !== -1) {
                    content = content.replace(themeImport, newThemeImport);
                    host.overwrite(path, content);
                }
            }
        });
    }
};
