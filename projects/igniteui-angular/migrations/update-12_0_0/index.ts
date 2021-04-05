import { Element } from '@angular/compiler';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, getAttribute, findElementNodes, getSourceOffset, hasAttribute, parseFile } from '../common/util';

const version = '12.0.0';

export default (): Rule => (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`
    );

    const COMPONENTS = [
        {
            component: 'igx-bottom-nav',
            tags: ['igx-bottom-nav-item', 'igx-tab-panel', 'igx-tab'],
            tabItem: 'igx-bottom-nav-item',
            headerItem: 'igx-bottom-nav-header',
            panelItem: 'igx-bottom-nav-content',
            iconDirective: 'igxBottomNavHeaderIcon',
            labelDirective: 'igxBottomNavHeaderLabel'
        },
        {
            component: 'igx-tabs',
            tags: ['igx-tabs-group', 'igx-tab-item'],
            tabItem: 'igx-tab-item',
            headerItem: 'igx-tab-header',
            panelItem: 'igx-tab-content',
            iconDirective: 'igxTabHeaderIcon',
            labelDirective: 'igxTabHeaderLabel'
        }
    ];
    const update = new UpdateChanges(__dirname, host, context);
    const changes = new Map<string, FileChange[]>();
    const htmlFiles = update.templateFiles;

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

    const isEmptyOrSpaces = (str) => str === null || str === '' || str === '\n' || str.match(/^ *$/) !== null;

    // Replace the tabsType input with tabsAligment
    for (const path of htmlFiles) {
        findElementNodes(parseFile(host, path), 'igx-tabs')
            .forEach(node => {
                if (hasAttribute(node as Element, 'type')) {
                    const { startTag, file } = getSourceOffset(node as Element);
                    const tabsType = getAttribute(node as Element, 'type')[0];
                    let alignment;
                    if (tabsType.value.toLowerCase() === 'fixed') {
                        alignment = 'justify';
                    } else if (tabsType.value.toLowerCase() === 'contentfit') {
                        alignment = 'start';
                    }
                    const tabAlignment = alignment ? ` tabAlignment="${alignment}"` : '';
                    addChange(file.url, new FileChange(startTag.end - 1, tabAlignment));
                }
            });
    }
    applyChanges();
    changes.clear();

    for (const comp of COMPONENTS) {
        for (const path of htmlFiles) {
            // Replace the <ng-template igxTab> if any with <igx-tab-item>
            findElementNodes(parseFile(host, path), comp.tags)
                .map(tab => findElementNodes([tab], 'ng-template'))
                .reduce((prev, curr) => prev.concat(curr), [])
                .filter(template => hasAttribute(template as Element, 'igxTab'))
                .forEach(node => {
                    const { startTag, endTag, file } = getSourceOffset(node as Element);
                    const content = file.content.substring(startTag.end, endTag.start);
                    const textToReplace = file.content.substring(startTag.start, endTag.end);
                    const tabPanel = `<${comp.headerItem}>${content}</${comp.headerItem}>`;
                    addChange(file.url, new FileChange(startTag.start, tabPanel, textToReplace, 'replace'));
                });


            applyChanges();
            changes.clear();

            // Convert label and icon to igx-tab-header children ->
            // <igx-icon igxTabHeaderIcon> and <span igxTabHeaderLabel>
            findElementNodes(parseFile(host, path), comp.tags).
                map(node => getSourceOffset(node as Element)).
                forEach(offset => {
                    const { startTag, endTag, file, node } = offset;
                    // Label content
                    let labelText = '';
                    if (hasAttribute(node, 'label')) {
                        const labelAttr = getAttribute(node, 'label')[0];
                        labelText = `\n<span ${comp.labelDirective}>${labelAttr.value}</span>\n`;
                    }
                    // Icon content
                    let iconText = '';
                    if (hasAttribute(node, 'icon')) {
                        const iconAttr = getAttribute(node, 'icon')[0];
                        iconText = `\n<igx-icon ${comp.iconDirective}>${iconAttr.value}</igx-icon>`;
                    }
                    // RouterLink
                    let routerLinkText = '';
                    if (hasAttribute(node, 'routerLink')) {
                        const routerLink = getAttribute(node, 'routerLink')[0];
                        routerLinkText = ` ${routerLink.name}="${routerLink.value}"`;
                    }

                    if (iconText || labelText || routerLinkText) {
                        // eslint-disable-next-line max-len
                        const tabHeader = `\n<${comp.headerItem}${routerLinkText}>${iconText}${labelText}</${comp.headerItem}>`;
                        addChange(file.url, new FileChange(startTag.end, tabHeader));
                    }
                });

            applyChanges();
            changes.clear();

            // Grab the content between <igx-tabs-group> and create a <igx-tab-content>
            findElementNodes(parseFile(host, path), comp.tags)
                .map(node => getSourceOffset(node as Element))
                .forEach(offset => {
                    const tabHeader = offset.node.children.find(c => (c as Element).name === comp.headerItem);
                    if (tabHeader) {
                        const content = offset.file.content.substring(tabHeader.sourceSpan.end.offset, offset.endTag.start);
                        if (!isEmptyOrSpaces(content)) {
                            const tabPanel = `\n<${comp.panelItem}>${content}</${comp.panelItem}>\n`;
                            addChange(offset.file.url, new FileChange(tabHeader.sourceSpan.end.offset, tabPanel, content, 'replace'));
                        }
                    }
                });

            applyChanges();
            changes.clear();

            // Insert a comment indicating the change/replacement
            findElementNodes(parseFile(host, path), comp.component).
                map(node => getSourceOffset(node as Element)).
                forEach(offset => {
                    const { startTag, file } = offset;
                    // eslint-disable-next-line max-len
                    const commentText = `<!--NOTE: This component has been updated by Infragistics migration: v${version}\nPlease check your template whether all bindings/event handlers are correct.-->\n`;
                    addChange(file.url, new FileChange(startTag.start, commentText));
                });

            applyChanges();
            changes.clear();
        }
    }

    // Apply all selector and input changes
    update.applyChanges();
};
