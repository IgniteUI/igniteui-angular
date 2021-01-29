import { Directive, Input, TemplateRef, ViewChild } from '@angular/core';
import { IgxTabItemNewBase, IgxTabsBaseNew } from './tabs-base';

@Directive()
export abstract class IgxTabItemDirective implements IgxTabItemNewBase {
    /** @hidden */
    @ViewChild('headerTemplate', { static: true })
    public headerTemplate: TemplateRef<any>;

    /** @hidden */
    @ViewChild('panelTemplate', { static: true })
    public panelTemplate: TemplateRef<any>;

    @Input()
    public disabled = false;

    private _selected = false;

    @Input()
    public get selected(): boolean {
        return this._selected;
    };

    public set selected(value: boolean) {
        if (this._selected !== value) {
            console.log(`selected: ${value}`);

            this._selected = value;
            this._tabs.selectTab(this, this._selected);
        }
    }

    /** @hidden */
    constructor(private _tabs: IgxTabsBaseNew) {
    }

}
