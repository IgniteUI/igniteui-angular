import { ContentChild, Directive, Input, TemplateRef, ViewChild } from '@angular/core';
import { Direction, IgxSlideComponentBase } from '../carousel/carousel-base';
import { IgxTabItemBase, IgxTabPanelBase, IgxTabsBase } from './tabs.base';

@Directive()
export abstract class IgxTabItemDirective implements IgxTabItemBase, IgxSlideComponentBase {
    /** @hidden */
    @ContentChild(IgxTabPanelBase)
    public panelComponent: IgxTabPanelBase;

    /** @hidden */
    @ViewChild('headerTemplate', { static: true })
    public headerTemplate: TemplateRef<any>;

    /** @hidden */
    @ViewChild('panelTemplate', { static: true })
    public panelTemplate: TemplateRef<any>;

    @Input()
    public disabled = false;

    /** @hidden */
    public direction = Direction.NONE;
    /** @hidden */
    public previous: boolean;

    private _selected = false;

    @Input()
    public get selected(): boolean {
        return this._selected;
    };

    public set selected(value: boolean) {
        if (this._selected !== value) {
            console.log(`selected: ${value}`);

            this._selected = value;
            this.tabs.selectTab(this, this._selected);
        }
    }

    /** @hidden */
    constructor(private tabs: IgxTabsBase) {
    }
}
