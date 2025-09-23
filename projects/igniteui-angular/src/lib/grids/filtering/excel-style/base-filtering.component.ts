import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, inject } from '@angular/core';
import { PlatformUtil } from '../../../core/utils';
import { IgxOverlayService } from '../../../services/overlay/overlay';
import { ExpressionUI, FilterListItem } from './common';



@Directive()
export abstract class BaseFilteringComponent {
    protected cdr = inject(ChangeDetectorRef);
    public element = inject(ElementRef<HTMLElement>);
    protected platform = inject(PlatformUtil);


    public abstract column: any;
    public abstract get grid(): any;

    public abstract overlayComponentId: string;
    public abstract mainDropdown: ElementRef<HTMLElement>;
    public abstract expressionsList: ExpressionUI[];
    public abstract listData: FilterListItem[];
    public abstract isHierarchical: boolean;

    public abstract loadingStart: EventEmitter<undefined>;
    public abstract loadingEnd: EventEmitter<undefined>;
    public abstract initialized: EventEmitter<undefined>;
    public abstract columnChange: EventEmitter<any>;
    public abstract sortingChanged: EventEmitter<undefined>;
    public abstract listDataLoaded: EventEmitter<undefined>;

    public abstract initialize(column: any, overlayService: IgxOverlayService): void;
    public abstract detectChanges(): void;
    public abstract hide(): void;
    public abstract closeDropdown(): void;
    public abstract onSelect(): void;
    public abstract onPin(): void;
    public abstract onHideToggle(): void;
    public abstract cancel(): void;
}
