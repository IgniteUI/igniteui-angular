import {
    Component,
    ElementRef,
    Inject,
    NgModule,
    ViewChild
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { IgxOverlayService } from './overlay';

fdescribe('igxOverlay', () => {
    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                DynamicModule
            ],
            declarations: [
                EmptyPageComponent
            ],
            providers: [IgxOverlayService]
        }).compileComponents();
    });
    it('Unit - OverlayElement should return a div attached to Document\'s body', () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();

        fixture.componentInstance.buttonElement.nativeElement.click();
        fixture.whenStable().then(() => {
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.display).toEqual('block');
            expect(overlayDiv.classList.contains('overlay')).toBeTruthy();
            fixture.componentInstance.overlay.hideAll();
        });
    });
    it('Unit - Should show component passed to overlay',  () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();

        fixture.componentInstance.buttonElement.nativeElement.click();
        fixture.whenStable().then(() => {
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.display).toEqual('block');
            expect(overlayDiv.children.length).toEqual(1);
            expect(overlayDiv.children[0].localName).toEqual('ng-component');

            fixture.componentInstance.overlay.hideAll();
        });
    });
    fit('Unit - Hide() should hide component and overlay',  () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();

        fixture.componentInstance.overlay.show(SimpleDynamicComponent);
        fixture.componentInstance.overlay.show(SimpleDynamicComponent);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.display).toEqual('block');
            expect(overlayDiv.children.length).toEqual(2);
            expect(overlayDiv.children[0].localName).toEqual('ng-component');
            expect(overlayDiv.children[1].localName).toEqual('ng-component');

            fixture.componentInstance.overlay.hide(1);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.display).toEqual('block');
            expect(overlayDiv.children.length).toEqual(1);
            expect(overlayDiv.children[0].localName).toEqual('ng-component');

            fixture.componentInstance.overlay.hide(0);
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.display).toEqual('none');
            expect(overlayDiv.children.length).toEqual(0);
        });
    });
    fit('Unit - HideAll() should hide all components and overlay',  () => {
        const fixture = TestBed.createComponent(EmptyPageComponent);
        fixture.detectChanges();
        fixture.componentInstance.overlay.show(SimpleDynamicComponent);
        fixture.componentInstance.overlay.show(SimpleDynamicComponent);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.display).toEqual('block');
            expect(overlayDiv.children.length).toEqual(2);
            expect(overlayDiv.children[0].localName).toEqual('ng-component');
            expect(overlayDiv.children[1].localName).toEqual('ng-component');

            fixture.componentInstance.overlay.hideAll();
            return fixture.whenStable();
        }).then(() => {
            fixture.detectChanges();
            const overlayDiv = fixture.debugElement.nativeElement.parentElement.lastChild;
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.style.display).toEqual('none');
            expect(overlayDiv.children.length).toEqual(0);
        });
    });
});

@Component({
    template: '<button #button (click)=\'click($event)\'>Show Overlay</button>'
})
export class EmptyPageComponent {
    constructor(@Inject(IgxOverlayService) public overlay: IgxOverlayService) { }

    @ViewChild('button') buttonElement: ElementRef;

    click(event) {
        this.overlay.show(SimpleDynamicComponent);
    }
}

@Component({
    template: '<div style=\'position: absolute; width:100px; height: 100px; background-color: red\'></div>'
})
export class SimpleDynamicComponent { }

const TEST_COMPONENTS = [
    SimpleDynamicComponent
];

@NgModule({
    imports: [BrowserModule],
    declarations: [TEST_COMPONENTS],
    exports: [TEST_COMPONENTS],
    entryComponents: [TEST_COMPONENTS]
})
export class DynamicModule { }
