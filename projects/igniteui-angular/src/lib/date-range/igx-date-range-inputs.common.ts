import { Component } from '@angular/core';
import { IgxInputGroupComponent } from '../input-group/input-group.component';
import { IgxInputGroupBase } from '../input-group/input-group.common';

/**
 * @hidden
 * @internal
 */
@Component({
    template: ``,
    selector: `igx-date-range-base`
})
class IgxDateRangeBaseComponent extends IgxInputGroupComponent {
    public get nativeElement() {
        return this.element.nativeElement;
    }

    /**
     * @hidden
     * @internal
     */
    public setFocus(): void {
        this.nativeElement.focus();
    }

    /**
     * @hidden
     */
    public updateValue(value: any) {
        this.input.value = value;
    }
}

@Component({
    selector: 'igx-date-start',
    templateUrl: 'igx-date-range-inputs.common.html',
    providers: [{ provide: IgxInputGroupBase, useExisting: IgxDateStartComponent }]
})
export class IgxDateStartComponent extends IgxDateRangeBaseComponent { }

@Component({
    selector: 'igx-date-end',
    templateUrl: 'igx-date-range-inputs.common.html',
    providers: [{ provide: IgxInputGroupBase, useExisting: IgxDateEndComponent }]
})
export class IgxDateEndComponent extends IgxDateRangeBaseComponent { }

@Component({
    selector: 'igx-date-single',
    templateUrl: 'igx-date-range-inputs.common.html',
    providers: [{ provide: IgxInputGroupBase, useExisting: IgxDateSingleComponent }]
})
export class IgxDateSingleComponent extends IgxDateRangeBaseComponent { }
