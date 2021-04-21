import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { IgxInputGroupComponent, IgxInputGroupModule } from '../input-group/public_api';
import { IgxTextSelectionModule } from '../directives/text-selection/text-selection.directive';
import { configureTestSuite } from '../test-utils/configure-suite';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxCalendarModule } from '../calendar/public_api';
import { IgxIconModule } from '../icon/public_api';
import { IgxCalendarContainerModule } from '../date-common/calendar-container/calendar-container.component';
import { IgxDatePickerComponent, IgxDatePickerModule } from './public_api';
import { IgxOverlayService, OverlayCancelableEventArgs, OverlayClosingEventArgs, OverlayEventArgs } from '../services/public_api';
import { AnimationMetadata, AnimationOptions } from '@angular/animations';
import { EventEmitter, QueryList, Renderer2 } from '@angular/core';

describe('IgxDatePicker', () => {
    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
            ],
            imports: [IgxDatePickerModule, FormsModule, ReactiveFormsModule,
                NoopAnimationsModule, IgxInputGroupModule, IgxCalendarModule,
                IgxButtonModule, IgxTextSelectionModule, IgxIconModule,
                IgxCalendarContainerModule]
        })
            .compileComponents();
    }));

    let mockElement: any;
    let mockElementRef: any;
    let mockFactoryResolver: any;
    let mockApplicationRef: any;
    let mockAnimationBuilder: any;
    let mockDocument: any;
    let mockNgZone: any;
    let mockPlatformUtil: any;
    let overlay: IgxOverlayService | any;
    let mockInjector;
    let ngModuleRef: any;
    const elementRef = { nativeElement: null };
    const mockNgControl = jasmine.createSpyObj('NgControl',
        ['registerOnChangeCb',
            'registerOnTouchedCb',
            'registerOnValidatorChangeCb']);
    beforeEach(() => {
        mockFactoryResolver = {
            resolveComponentFactory: (c: any) => ({ // eslint-disable-line
                create: (i: any) => ({ // eslint-disable-line
                    hostView: '',
                    location: mockElementRef,
                    changeDetectorRef: { detectChanges: () => { } },
                    destroy: () => { }
                })
            })
        };
        ngModuleRef = ({ // eslint-disable-line
            injector: (...args: any[]) => { }, // eslint-disable-line
            componentFactoryResolver: mockFactoryResolver,
            instance: () => { },
            destroy: () => { },
            onDestroy: (fn: any) => { } // eslint-disable-line
        });
        mockElement = {
            style: { visibility: '', cursor: '', transitionDuration: '' },
            classList: { add: () => { }, remove: () => { } },
            appendChild: () => { },
            removeChild: () => { },
            addEventListener: (type: string, listener: (this: HTMLElement, ev: MouseEvent) => any) => { }, // eslint-disable-line
            removeEventListener: (type: string, listener: (this: HTMLElement, ev: MouseEvent) => any) => { }, // eslint-disable-line
            getBoundingClientRect: () => ({ width: 10, height: 10 }),
            insertBefore: (newChild: HTMLDivElement, refChild: Node) => { }, // eslint-disable-line
            contains: () => { }
        };
        mockElement.parent = mockElement;
        mockElement.parentElement = mockElement;
        mockElementRef = { nativeElement: mockElement };
        mockApplicationRef = { attachView: (h: any) => { }, detachView: (h: any) => { } }; // eslint-disable-line
        mockInjector = jasmine.createSpyObj('Injector', {
            get: mockNgControl
        });
        mockAnimationBuilder = {
            build: (a: AnimationMetadata | AnimationMetadata[]) => ({ // eslint-disable-line
                create: (e: any, opt?: AnimationOptions) => ({ // eslint-disable-line
                    onDone: (fn: any) => { }, // eslint-disable-line
                    onStart: (fn: any) => { }, // eslint-disable-line
                    onDestroy: (fn: any) => { }, // eslint-disable-line
                    init: () => { },
                    hasStarted: () => true,
                    play: () => { },
                    pause: () => { },
                    restart: () => { },
                    finish: () => { },
                    destroy: () => { },
                    rest: () => { },
                    setPosition: (p: any) => { }, // eslint-disable-line
                    getPosition: () => 0,
                    parentPlayer: {},
                    totalTime: 0,
                    beforeDestroy: () => { }
                })
            })
        };
        mockDocument = {
            body: mockElement,
            defaultView: mockElement,
            createElement: () => mockElement,
            appendChild: () => { },
            addEventListener: (type: string, listener: (this: HTMLElement, ev: MouseEvent) => any) => { }, // eslint-disable-line
            removeEventListener: (type: string, listener: (this: HTMLElement, ev: MouseEvent) => any) => { } // eslint-disable-line
        };
        mockNgZone = {};
        mockPlatformUtil = { isIOS: false };

        overlay = new IgxOverlayService(
            mockFactoryResolver, mockApplicationRef, mockInjector, mockAnimationBuilder, mockDocument, mockNgZone, mockPlatformUtil);
    });

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    describe('Unit Tests', () => {
        // pending('WIP');
        let ngModel;
        let element;
        let cdr;
        let moduleRef;
        let injector;
        let inputGroup: IgxInputGroupComponent;
        let renderer2: Renderer2;
        const platform = {} as any;
        describe('API tests', () => {
            //#region API Methods
            it('should properly update the collapsed state with open/close/toggle methods', () => {
                const datePicker = new IgxDatePickerComponent(elementRef, null, overlay, null, mockInjector, null, null);

                datePicker.open();
                expect(datePicker.collapsed).toBeFalse();

                datePicker.close();
                expect(datePicker.collapsed).toBeTrue();

                datePicker.toggle();
                expect(datePicker.collapsed).toBeFalse();

                datePicker.toggle();
                expect(datePicker.collapsed).toBeTrue();
            });

            it('should update the picker\'s value with the select method', () => {
                const datePicker = new IgxDatePickerComponent(elementRef, null, overlay, null, mockInjector, null, null);
                spyOn(datePicker.valueChange, 'emit');

                datePicker.value = new Date();

                const newDate = new Date(2012, 10, 5);
                datePicker.select(newDate);
                expect(datePicker.valueChange).toHaveBeenCalledOnceWith(newDate);
                expect(datePicker.value).toEqual(newDate);
            });

            it('should clear the picker\'s value with the clear method', () => {
                const datePicker = new IgxDatePickerComponent(elementRef, null, overlay, null, mockInjector, null, null);
                spyOn(datePicker.valueChange, 'emit');

                datePicker.value = new Date();

                datePicker.clear();
                expect(datePicker.valueChange).toHaveBeenCalledOnceWith(null);
                expect(datePicker.value).toEqual(null);
            });

            //#endregion

            //#region Events
            it('should properly emit open/close events', () => {
                const datePicker = new IgxDatePickerComponent(elementRef, null, overlay, null, mockInjector, null, null);
                spyOn(datePicker.opened, 'emit');
                spyOn(datePicker.closed, 'emit');

                datePicker.open();
                expect(datePicker.opened).toHaveBeenCalledOnceWith({ owner: datePicker });

                datePicker.close();
                expect(datePicker.closed).toHaveBeenCalledOnceWith({ owner: datePicker });
            });

            it('should properly emit opening/closing events', () => {
                const datePicker = new IgxDatePickerComponent(elementRef, null, overlay, null, mockInjector, null, null);
                spyOn(datePicker.opening, 'emit');
                spyOn(datePicker.closing, 'emit');

                datePicker.open();
                expect(datePicker.opening).toHaveBeenCalledOnceWith({ owner: datePicker, event: { cancel: false } });

                datePicker.close();
                expect(datePicker.closing).toHaveBeenCalledOnceWith({ owner: datePicker, event: { cancel: false } });
            });

            it('should emit valueChange when the value changes', () => {
                const datePicker = new IgxDatePickerComponent(elementRef, null, overlay, null, mockInjector, null, null);
                spyOn(datePicker.valueChange, 'emit');

                const newDate = new Date();
                datePicker.value = newDate;
                expect(datePicker.valueChange).toHaveBeenCalledOnceWith(newDate);
            });

            it('should emit validationFailed if a value outside of a given range was provided', () => {
                const datePicker = new IgxDatePickerComponent(elementRef, null, overlay, null, mockInjector, null, null);
                spyOn(datePicker.validationFailed, 'emit');

                const validDate = new Date(2012, 5, 7);
                datePicker.minValue = new Date(2012, 5, 4);
                datePicker.maxValue = new Date(2012, 5, 10);

                datePicker.value = validDate;
                datePicker.value = new Date(2012, 6, 1);
                expect(datePicker.validationFailed).toHaveBeenCalledOnceWith({ owner: datePicker, prevValue: validDate });
            });
            //#endregion
        });

        describe('Integration tests', () => {
            describe('Events', () => {
                it('should be able to cancel opening/closing', () => {
                    pending('TODO');
                });
            });

            describe('Keyboard navigation', () => {
                pending('TODO');
            });

            describe('Projections', () => {
                pending('TODO');
            });
        });

        describe('Control Value Accessor', () => {
            beforeEach(() => {
                ngModel = {
                    control: { touched: false, dirty: false, validator: null },
                    valid: false,
                    statusChanges: new EventEmitter(),
                };
                overlay = {
                    onOpening: new EventEmitter<OverlayCancelableEventArgs>(),
                    onOpened: new EventEmitter<OverlayEventArgs>(),
                    onClosed: new EventEmitter<OverlayEventArgs>(),
                    onClosing: new EventEmitter<OverlayClosingEventArgs>()
                };
                element = {}; // eslint-disable-line
                cdr = { // eslint-disable-line
                    markForCheck: () => { },
                    detectChanges: () => { },
                    detach: () => { },
                    reattach: () => { }
                };
                moduleRef = {}; // eslint-disable-line
                injector = { get: () => ngModel }; // eslint-disable-line
                inputGroup = new IgxInputGroupComponent(null, null, null, document, renderer2, mockPlatformUtil); // eslint-disable-line
                renderer2 = jasmine.createSpyObj('Renderer2', ['setAttribute'], [{}, 'aria-labelledby', 'test-label-id-1']);
                spyOn(renderer2, 'setAttribute').and.callFake(() => {
                });
            });

            it('should initialize date picker with required correctly', () => {
                const datePicker = new IgxDatePickerComponent(overlay, element, cdr, moduleRef, injector, renderer2, platform);
                datePicker['_inputGroup'] = inputGroup;
                datePicker['_inputDirectiveUserTemplates'] = new QueryList();
                spyOnProperty(datePicker as any, 'inputGroup').and.returnValue(null);
                ngModel.control.validator = () => ({ required: true });
                datePicker.ngOnInit();
                datePicker.ngAfterViewInit();
                datePicker.ngAfterViewChecked();

                expect(datePicker).toBeDefined();
                expect(inputGroup.isRequired).toBeTruthy();
            });

            it('should update inputGroup isRequired correctly', () => {
                const datePicker = new IgxDatePickerComponent(overlay, element, cdr, moduleRef, injector, renderer2, platform);
                datePicker['_inputGroup'] = inputGroup;
                datePicker['_inputDirectiveUserTemplates'] = new QueryList();
                spyOnProperty(datePicker as any, 'inputGroup').and.returnValue(null);
                datePicker.ngOnInit();
                datePicker.ngAfterViewInit();
                datePicker.ngAfterViewChecked();

                expect(datePicker).toBeDefined();
                expect(inputGroup.isRequired).toBeFalsy();

                ngModel.control.validator = () => ({ required: true });
                ngModel.statusChanges.emit();
                expect(inputGroup.isRequired).toBeTruthy();

                ngModel.control.validator = () => ({ required: false });
                ngModel.statusChanges.emit();
                expect(inputGroup.isRequired).toBeFalsy();
            });
        });

        describe('Validator', () => {
            pending('TODO');
        });
    });
});
