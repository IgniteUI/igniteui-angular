import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '15.0.11';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();

    const updateTypographyAndScrollbar = (content: string) => {
        const typography = /igx-typography/g,
            scrollbar = /igx-scrollbar/g;
        return content
            .replace(typography, 'ig-typography')
            .replace(scrollbar, 'ig-scrollbar');
    };

    const indexPath = '/src/index.html';
    if (host.exists(indexPath)) {
        host.overwrite(indexPath, updateTypographyAndScrollbar(host.read(indexPath).toString()));
    }

    update.templateFiles.forEach(path =>
        host.overwrite(path, updateTypographyAndScrollbar(host.read(path).toString()))
    );

    const graysVar = /\$grays:\s*(.+)(\r\n|\r|\n|,)/,
        graysString = /'grays'/g,
        graysTarget = `'gray'`;
    update.sassFiles.forEach(path => {
        let content = host.read(path).toString();
        const matches = content.matchAll(new RegExp(graysVar, 'g'));
        for (const match of matches) {
            content = content.replace(graysVar, `$gray: ${match[1]}${match[2]}`);
        }

        if (graysString.test(content)) {
            content = content.replace(graysString, graysTarget);
        }

        host.overwrite(path, updateTypographyAndScrollbar(content));
    });
};
