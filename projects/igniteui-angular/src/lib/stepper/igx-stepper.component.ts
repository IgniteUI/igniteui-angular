import { AfterContentInit, Component, ContentChildren, Input, NgModule, OnDestroy, QueryList } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxAccordionModule } from '../accordion/accordion.module';
import { IgxCarouselModule } from '../carousel/carousel.component';
import { IBaseEventArgs } from '../core/utils';
import { IgxStepComponent } from './step/igx-step.component';

@Component({
    selector: 'igx-stepper',
    templateUrl: 'igx-stepper.component.html'
})
export class IgxStepperComponent implements AfterContentInit, OnDestroy {
    @ContentChildren(IgxStepComponent)
    public steps: QueryList<IgxStepComponent>;

    @Input()
    public linear: boolean;

    private destroy$ = new Subject();

    public navigateTo(id: number) {
        this.steps.forEach(s => {
            s.toggleActive(id);
        });
    }

    public ngAfterContentInit() {
        this.steps.forEach(s => {
            s.activated.pipe(takeUntil(this.destroy$)).subscribe((e: IBaseEventArgs) => {
                const stepperId = e.owner.id;
                this.steps.forEach(_s => {
                    _s.toggleActive(stepperId);
                });
            });
        });
    }

    public ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}

@NgModule({
    imports: [
        BrowserAnimationsModule,
        IgxCarouselModule,
        IgxAccordionModule
    ],
    declarations: [
        IgxStepComponent,
        IgxStepperComponent
    ],
    exports: [
        IgxStepComponent,
        IgxStepperComponent
    ]
})
export class IgxStepperModule { }
