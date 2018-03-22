import { CommonModule } from "@angular/common";
import { Component, ContentChild, ContentChildren, ElementRef, HostBinding,
    HostListener, Input, NgModule, QueryList, Renderer2 } from "@angular/core";
import { IgxHintDirective } from "../directives/hint/hint.directive";
import { IgxInputDirective } from "../directives/input/input.directive";
import { IgxLabelDirective } from "../directives/label/label.directive";
import { IgxPrefixDirective } from "../directives/prefix/prefix.directive";
import { IgxSuffixDirective } from "../directives/suffix/suffix.directive";

enum IgxInputGroupType {
    line = `line` as any,
    box = `box` as any,
    border = `border` as any,
    search = `search` as any
}

@Component({
    selector: "igx-input-group",
    templateUrl: "input-group.component.html"
})
export class IgxInputGroupComponent {
    private _type = IgxInputGroupType.line;

    @HostBinding("class.igx-input-group")
    public defaultClass = true;

    @HostBinding("class.igx-input-group--placeholder")
    public hasPlaceholder = false;

    @HostBinding("class.igx-input-group--required")
    public isRequired = false;

    @HostBinding("class.igx-input-group--focused")
    public isFocused = false;

    @HostBinding("class.igx-input-group--filled")
    public isFilled = false;

    @HostBinding("class.igx-input-group--box")
    public isBox = false;

    @HostBinding("class.igx-input-group--border")
    public isBorder = false;

    @HostBinding("class.igx-input-group--search")
    public isSearch = false;

    @HostBinding("class.igx-input-group--disabled")
    public isDisabled = false;

    @HostBinding("class.igx-input-group--valid")
    public isValid = false;

    @HostBinding("class.igx-input-group--invalid")
    public isInvalid = false;

    @HostBinding("class.igx-input-group--warning")
    public hasWarning = false;

    @ContentChildren(IgxHintDirective, { read: IgxHintDirective })
    protected hints: QueryList<IgxHintDirective>;

    @ContentChild(IgxInputDirective, { read: IgxInputDirective })
    protected input: IgxInputDirective;

    @HostListener("click", ["$event"])
    public onClick(event) {
        this.input.focus();
    }

    @Input("type")
    set type(value: string) {
        const type: IgxInputGroupType = (IgxInputGroupType as any)[value];
        if (type !== undefined) {
            this.isBox = this.isBorder = this.isSearch = false;
            switch (type) {
                case IgxInputGroupType.box:
                    this.isBox = true;
                    break;
                case IgxInputGroupType.border:
                    this.isBorder = true;
                    break;
                case IgxInputGroupType.search:
                    this.isSearch = true;
                    break;
                default: break;
            }

            this._type = type;
        }
    }
    get type() {
        return this._type.toString();
    }

    constructor(public element: ElementRef, private _renderer: Renderer2) {
    }

    get hasHints() {
        return this.hints.length > 0;
    }

    get hasBorder() {
        return this._type === IgxInputGroupType.line ||
            this._type === IgxInputGroupType.box;
    }

    get isTypeLine() {
        return  this._type === IgxInputGroupType.line;
    }

    get isTypeBox() {
        return this._type === IgxInputGroupType.box;
    }

    get isTypeBorder() {
        return this._type === IgxInputGroupType.border;
    }

    get isTypeSearch() {
        return  this._type === IgxInputGroupType.search;
    }
}

@NgModule({
    declarations: [IgxInputGroupComponent, IgxHintDirective, IgxInputDirective, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective],
    exports: [IgxInputGroupComponent,  IgxHintDirective, IgxInputDirective, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective],
    imports: [CommonModule]
})
export class IgxInputGroupModule { }
