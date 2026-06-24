import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import {
    FileChange,
    findElementNodes,
    getSourceOffset,
    hasAttribute,
    parseFile
} from '../common/util';

const version = '22.0.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`
    );

    const { HtmlParser, Element } = await import('@angular/compiler');

    const update = new UpdateChanges(__dirname, host, context);
    const changes = new Map<string, FileChange[]>();
    const parser = new HtmlParser();

    const applyChanges = () => {
        for (const [path, fileChanges] of changes.entries()) {
            let content = host.read(path)!.toString();
            fileChanges
                .sort((a, b) => b.position - a.position)
                .forEach((c) => {
                    content = c.apply(content);
                });
            host.overwrite(path, content);
        }
    };

    const addChange = (path: string, change: FileChange) => {
        if (!changes.has(path)) {
            changes.set(path, []);
        }
        changes.get(path)!.push(change);
    };

    // All form components that default to 'line' prior to this version
    const TAGS = [
        'igx-input-group',
        'igx-select',
        'igx-date-picker',
        'igx-date-range-picker',
        'igx-time-picker'
    ];

    const TYPE_ATTRS = ['type', '[type]'];

    for (const path of update.templateFiles) {
        const root = parseFile(parser, host, path);
        const nodes = findElementNodes(root, TAGS);

        for (const node of nodes) {
            if (!(node instanceof Element)) continue;

            // Skip if the element already has an explicit type binding
            if (hasAttribute(node, TYPE_ATTRS)) continue;

            const offset = getSourceOffset(node);
            const file = offset.file;

            // Insert type="line" right after the tag name in the start tag
            // e.g., <igx-input-group → <igx-input-group type="line"
            const tagNameEnd = offset.startTag.start + 1 + node.name.length;
            addChange(file.url, new FileChange(tagNameEnd, ' type="line"'));
        }
    }

    applyChanges();
    changes.clear();

    // IgxSelect: default positioning strategy changed to AutoPositionStrategy.
    // Insert a comment above each <igx-select> to inform the developer.
    const SELECT_NOTE =
        `<!-- IgxSelect: default positioning changed to AutoPositionStrategy (below/above input).\n` +
        `     To preserve overlap behavior: this.select.overlaySettings = { positionStrategy: new IgxSelectOverlapPositionStrategy(this.select) }; -->\n`;

    for (const path of update.templateFiles) {
        const content = host.read(path)!.toString();
        const root = parseFile(parser, host, path);
        const nodes = findElementNodes(root, 'igx-select');

        for (const node of nodes) {
            if (!(node instanceof Element)) continue;

            const { startTag, file } = getSourceOffset(node);
            const noteStart = Math.max(0, startTag.start - SELECT_NOTE.length);
            if (content.slice(noteStart, startTag.start) === SELECT_NOTE) continue;

            addChange(file.url, new FileChange(startTag.start, SELECT_NOTE));
        }
    }

    applyChanges();
    update.applyChanges();
};
