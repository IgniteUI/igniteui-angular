import { Directive, ElementRef, HostBinding, Input, TemplateRef } from '@angular/core';
import { IgxStepperLabelPosition } from './common';

@Directive({
    selector: '[igxStepValidIcon]'
})
export class IgxStepValidIconDirective {
    @HostBinding('class.igx-step__icon--valid')
    public defaultClass = true;
}

@Directive({
    selector: '[igxStepInvalidIcon]'
})
export class IgxStepInvalidIconDirective {
    @HostBinding('class.igx-step__icon--invalid')
    public defaultClass = true;
}
@Directive({
    selector: '[igxStepIcon]'
})
export class IgxStepIconDirective {
    @HostBinding('class.igx-step__icon')
    public defaultClass = true;
}

@Directive({
    selector: '[igxStepContent]'
})
export class IgxStepContentDirective {
    @HostBinding('class.igx-step__content')
    public defaultClass = true;

    constructor(public templateRef: TemplateRef<any>, public elementRef: ElementRef<any>) { }
}

@Directive({
    selector: '[igxStepLabel]'
})

export class IgxStepLabelDirective {
    @Input() public position = IgxStepperLabelPosition.Bottom;

    @HostBinding('class.igx-step__label')
    public defaultClass = true;

    @HostBinding('class.igx-step__label--bottom')
    public get bottomClass() {
        return this.position === IgxStepperLabelPosition.Bottom;
    }

    @HostBinding('class.igx-step__label--top')
    public get topClass() {
        return this.position === IgxStepperLabelPosition.Top;
    }

    @HostBinding('class.igx-step__label--end')
    public get endClass() {
        return this.position === IgxStepperLabelPosition.End;
    }

    @HostBinding('class.igx-step__label--start')
    public get startClass() {
        return this.position === IgxStepperLabelPosition.Start;
    }
}
