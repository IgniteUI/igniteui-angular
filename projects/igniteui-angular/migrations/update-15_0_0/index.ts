import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '15.0.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();


    // replace CSS custom properties prefix from --igx to --ig and grays to gray
    const CUSTOM_CSS_PROPERTIES = [
        '--igx-primary-',
        '--igx-secondary-',
        '--igx-grays-',
        '--igx-surface-',
        '--igx-info-',
        '--igx-success-',
        '--igx-warn-',
        '--igx-error-',
        '--igx-radius-factor',
        '--igx-elevation',
        '--igx-font-family',
        '--igx-h(\\d)-',
        '--igx-subtitle-(\\d)-',
        '--igx-body-(\\d)-',
        '--igx-button-',
        '--igx-caption-',
        '--igx-overline-'
    ];
    for (const entryPath of update.sassFiles) {
        let content = host.read(entryPath).toString();
        CUSTOM_CSS_PROPERTIES.forEach(cssProperty => {
            const regex = new RegExp(cssProperty, 'g');
            if (regex.test(content)) {
                let newCssProperty = cssProperty.replace(/igx/g, 'ig');
                newCssProperty = newCssProperty.replace(/grays/g, 'gray');
                newCssProperty = newCssProperty.replace('(\\d)', '$1');
                content = content.replace(regex, newCssProperty);
                host.overwrite(entryPath, content);
            }
        });
    }
};
