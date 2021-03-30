import { Element } from '@angular/compiler';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, getAttribute, findElementNodes, getSourceOffset, hasAttribute, parseFile } from '../common/util';
import { BindingChange, SelectorChange } from '../common/schema';

const version = '12.0.0';

class CustomUpdate extends UpdateChanges {
    private removedSelectorChanges: SelectorChange[];
    private removedInputChanges: BindingChange[];
    constructor(rootPath: string, host: Tree, context?: SchematicContext) {
        super(rootPath, host, context);
    }

    public applyOnlyBottomNavSelectorChange() {
        this.removedSelectorChanges = this.selectorChanges.changes.splice(1, this.selectorChanges.changes.length - 2);
        this.removedInputChanges = this.inputChanges.changes.splice(0);
    }

    public applyAllOtherChanges() {
        this.selectorChanges.changes = this.removedSelectorChanges;
        this.inputChanges.changes = this.removedInputChanges;
    }
}

export default (): Rule => (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`
    );

    const COMPONENTS = [
        {
            component: 'igx-bottom-nav',
            tags: ['igx-bottom-nav-item', 'igx-tab'],
            tabItem: 'igx-bottom-nav-item',
            headerItem: 'igx-bottom-nav-header',
            panelItem: 'igx-bottom-nav-panel',
            iconDirective: 'igxBottomNavHeaderIcon',
            labelDirective: 'igxBottomNavHeaderLabel'
        },
        {
            component: 'igx-tabs',
            tags: ['igx-tabs-group', 'igx-tab-item'],
            tabItem: 'igx-tab-item',
            headerItem: 'igx-tab-header',
            panelItem: 'igx-tab-panel',
            iconDirective: 'igxTabHeaderIcon',
            labelDirective: 'igxTabHeaderLabel'
        }
    ];
    const update = new CustomUpdate(__dirname, host, context);
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


    // Apply selector changes for igx-tab-panel(igx-bottom-nav-item) component
    update.applyOnlyBottomNavSelectorChange();
    update.applyChanges();

    // Replace the tabsType input with tabsAligment
    for (const path of htmlFiles) {
        findElementNodes(parseFile(host, path), 'igx-tabs')
            .forEach(node => {
                if (hasAttribute(node as Element, 'tabsType')) {
                    const { startTag, file } = getSourceOffset(node as Element);
                    const tabsType = getAttribute(node as Element, 'tabsType')[0];
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
            // Replace the bottom-nav -> igx-tab with igx-bottom-nav-item
            if (comp.component === 'igx-bottom-nav') {
                findElementNodes(parseFile(host, path), comp.tags[1])
                    .map(node => getSourceOffset(node as Element))
                    .forEach(offset => {
                        const tab = offset.file.content.substring(offset.startTag.start, offset.endTag.end);
                        const replacementText = tab.replace('igx-tab', 'igx-bottom-nav-item').replace('igx-tab', 'igx-bottom-nav-item');
                        addChange(offset.file.url, new FileChange(offset.startTag.start, replacementText, tab, 'replace'));
                    });

                applyChanges();
                changes.clear();
            }

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

            // Grab the content between <igx-tabs-group> and create a <igx-tab-panel>
            findElementNodes(parseFile(host, path), comp.tags)
                .map(node => getSourceOffset(node as Element))
                .forEach(offset => {
                    const tabHeader = offset.node.children.find(c => (c as Element).name === comp.headerItem);
                    if (tabHeader) {
                        const content = offset.file.content.substring(tabHeader.sourceSpan.end.offset, offset.endTag.start);
                        console.log('CONTENT', content);

                        if (!isEmptyOrSpaces(content)) {
                            const tabPanel = `\n<${comp.panelItem}>${content}</${comp.panelItem}>\n`;
                            addChange(offset.file.url, new FileChange(tabHeader.sourceSpan.end.offset, tabPanel, content, 'replace'));
                        }
                    }
                });

            applyChanges();
            changes.clear();
        }
    }

    // Apply all input changes plus selector change for igx-tabs-group
    update.applyAllOtherChanges();
    update.applyChanges();
};
