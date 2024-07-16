import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import type { Element } from '@angular/compiler';
// use bare specifier to escape the schematics encapsulation for the dynamic import:
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.js';
import type { Options } from '../../schematics/interfaces/options';
import { BoundPropertyObject, InputPropertyType, UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, getAttribute, getSourceOffset, parseFile, hasAttribute } from '../common/util';

const version = '15.1.0';

export default (options: Options): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const { HtmlParser } = await nativeImport('@angular/compiler') as typeof import('@angular/compiler');
    const update = new UpdateChanges(__dirname, host, context);
    const cardsToMigrate = new Set<any>();
    const CARD_ACTIONS = ['igx-card-actions'];
    const prop = ['igxButton'];
    const changes = new Map<string, FileChange[]>();

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

    const getChildren = (parent: Element, buttons: any[], icons: any[]) => {
        const cardButtons = parent.children.filter(btn => (btn as Element).attrs !== undefined  && hasAttribute(btn as Element, prop));
        const cardIcons = parent.children.filter(btn => (btn as Element).name === 'igx-icon');
        buttons.push(...cardButtons);
        icons.push(...cardIcons);
    }

    for (const path of update.templateFiles) {
        cardsToMigrate.clear();
        const cardActions = findElementNodes(parseFile(new HtmlParser(), host, path), CARD_ACTIONS);
        cardActions.forEach(card => {
            const card_action_elem = card as Element;
            const buttons: any[] = [];
            const icons: any[] = [];
            getChildren(card_action_elem, buttons, icons);

            icons.map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { startTag, file, node } = offset;
                const end = getAttribute(node, 'igxEnd')[0];

                if (!end) {
                    addChange(file.url, new FileChange(startTag.end - 1, ' igxEnd'));
                }
            })

            buttons.map(node => getSourceOffset(node as Element))
            .forEach(offset => {
                const { startTag, file, node } = offset;
                const { value } = getAttribute(node, prop)[0];
                const start = getAttribute(node, 'igxStart')[0];
                const end = getAttribute(node, 'igxEnd')[0];

                if (!start && value !== 'icon') {
                  addChange(file.url, new FileChange(startTag.end - 1, ' igxStart'));
                }

                if (!end && value === 'icon') {
                  addChange(file.url, new FileChange(startTag.end - 1, ' igxEnd'));
                }
            });
        });
    }

    update.shouldInvokeLS = options['shouldInvokeLS'];
    update.addValueTransform('roundShape_is_deprecated', (args: BoundPropertyObject): void => {
        args.bindingType = InputPropertyType.STRING;

        switch (args.value) {
            case 'true':
                args.value = 'circle';
                break;
            case 'false':
                args.value = 'square';
                break;
            default:
                args.value += ` ? 'circle' : 'square' `;
        }
    });

    applyChanges();
    update.applyChanges();
};
