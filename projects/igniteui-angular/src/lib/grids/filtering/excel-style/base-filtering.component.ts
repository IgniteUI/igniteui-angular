import { ChangeDetectorRef, Directive, ElementRef, EventEmitter } from '@angular/core';
import { DisplayDensity } from '../../../core/displayDensity';
import { PlatformUtil } from '../../../core/utils';
import { IgxOverlayService } from '../../../services/overlay/overlay';
import { ExpressionUI, FilterListItem } from './common';



@Directive()
export abstract class BaseFilteringComponent {

    public abstract column: any;
    public abstract get grid(): any;
    public abstract get displayDensity(): DisplayDensity;

    public abstract overlayComponentId: string;
    public abstract mainDropdown: ElementRef<HTMLElement>;
    public abstract expressionsList: ExpressionUI[];
    public abstract listData: FilterListItem[];

    abstract loadingStart: EventEmitter<undefined>;
    abstract loadingEnd: EventEmitter<undefined>;
    abstract initialized: EventEmitter<undefined>;
    abstract columnChange: EventEmitter<any>;
    abstract sortingChanged: EventEmitter<undefined>;
    abstract listDataLoaded: EventEmitter<undefined>;

    constructor(
        protected cdr: ChangeDetectorRef,
        public element: ElementRef<HTMLElement>,
        protected platform: PlatformUtil
    ) { }


    abstract initialize(column: any, overlayService: IgxOverlayService): void;
    abstract detectChanges(): void;
    abstract hide(): void;
    abstract closeDropdown(): void;

}
