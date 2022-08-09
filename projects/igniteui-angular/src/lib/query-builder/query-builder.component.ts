import { CommonModule } from '@angular/common';
import { Component, NgModule, ViewChild } from '@angular/core';
import { PlatformUtil } from '../core/utils';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';

@Component({
    selector: 'igx-query-builder',
    templateUrl: './query-builder.component.html',
    styleUrls: ['./query-builder.component.css']
})
export class IgxQueryBuilderComponent {

    /**
     * @hidden @internal
     */
     @ViewChild(IgxToggleDirective)
     public contextMenuToggle: IgxToggleDirective;

    constructor(protected platform: PlatformUtil) { }

    /**
     * @hidden @internal
     */
     public clearSelection() {
        //TODO Implement clear selection for the context menu

        // for (const group of this.selectedGroups) {
        //     group.selected = false;
        // }
        // this.selectedGroups = [];

        // for (const expr of this.selectedExpressions) {
        //     expr.selected = false;
        // }
        // this.selectedExpressions = [];

        // this.toggleContextMenu();
    }

    /**
     * @hidden @internal
     */
    public onKeyDown(eventArgs: KeyboardEvent) {
        eventArgs.stopPropagation();
        const key = eventArgs.key;
        if (!this.contextMenuToggle.collapsed && (key === this.platform.KEYMAP.ESCAPE)) {
            this.clearSelection();
        }
    }
}
/**
 * @hidden
 */
 @NgModule({
    declarations: [IgxQueryBuilderComponent],
    exports: [IgxQueryBuilderComponent],
    imports: [CommonModule]
})
export class IgxQueryBuilderModule { }