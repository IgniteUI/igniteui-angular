/// <reference path="../../typings/globals/jasmine/index.d.ts" />
/// <reference path="../../typings/globals/es6-shim/index.d.ts" />
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const testing_1 = require('@angular/core/testing');
const core_1 = require('@angular/core');
const Infragistics = require('../../src/main');
function dispatchEv(element, eventType) {
    let event = new Event(eventType);
    element.dispatchEvent(event);
}
function main() {
    describe('Inragistics Angular2 Carousel', () => {
        let builder;
        beforeEach(testing_1.inject([testing_1.TestComponentBuilder], (tcb) => {
            builder = tcb;
        }));
        it("should initialize a carousel with two slides and then destroy it", (done) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild).toBeDefined();
                expect(fixture.componentInstance.viewChild instanceof Infragistics.Carousel).toBe(true);
                expect(fixture.componentInstance.viewChild.slides[0] instanceof Infragistics.Slide).toBe(true);
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.slides instanceof Array).toBe(true);
                expect(fixture.componentInstance.loop).toBe(true);
                expect(fixture.componentInstance.viewChild.pause).toBe(false);
                expect(fixture.componentInstance.viewChild.slides.length).toBe(2);
                expect(fixture.componentInstance.viewChild.interval).toBe(2500);
                fixture.componentInstance.viewChild.ngOnDestroy();
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.isDestroyed).toBe(true);
                done();
            });
        });
        it("Carousel disabled looping", (done) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {
                fixture.detectChanges();
                let lastSlide = fixture.componentInstance.viewChild.get(1);
                let firstSlide = fixture.componentInstance.viewChild.get(0);
                fixture.componentInstance.viewChild.loop = false;
                fixture.detectChanges();
                fixture.componentInstance.viewChild.next();
                fixture.componentInstance.viewChild.next();
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.current).toBe(lastSlide.index);
                fixture.componentInstance.viewChild.prev();
                fixture.componentInstance.viewChild.prev();
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.current).toBe(firstSlide.index);
                done();
            });
        });
        it('Carousel getter/setter tests', (done) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {
                fixture.detectChanges();
                // Setters
                fixture.componentInstance.viewChild.loop = false;
                fixture.componentInstance.viewChild.pause = false;
                fixture.componentInstance.viewChild.interval = 666;
                fixture.componentInstance.viewChild.navigation = false;
                fixture.detectChanges();
                // Getters
                expect(fixture.componentInstance.viewChild.loop).toBe(false);
                expect(fixture.componentInstance.viewChild.pause).toBe(false);
                expect(fixture.componentInstance.viewChild.interval).toBe(666);
                expect(fixture.componentInstance.viewChild.navigation).toBe(false);
                done();
            });
        });
        it('Carousel add/remove slides tests', (done) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {
                fixture.detectChanges();
                let currentSlide = fixture.componentInstance.viewChild.get(fixture.componentInstance.viewChild.current);
                fixture.componentInstance.viewChild.remove(currentSlide);
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.slides.length).toBe(1);
                currentSlide = fixture.componentInstance.viewChild.get(fixture.componentInstance.viewChild.current);
                fixture.componentInstance.viewChild.remove(currentSlide);
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.slides.length).toBe(0);
                fixture.componentInstance.viewChild.add(currentSlide);
                fixture.componentInstance.viewChild.add(currentSlide);
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.slides.length).toBe(2);
                done();
            });
        });
        it("Carousel public methods", (done) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {
                fixture.detectChanges();
                fixture.componentInstance.viewChild.pause = false;
                fixture.detectChanges();
                fixture.componentInstance.viewChild.stop();
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.isPlaying).toBe(false);
                fixture.componentInstance.viewChild.next();
                let currentSlide = fixture.componentInstance.viewChild.get(fixture.componentInstance.viewChild.current);
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.get(1)).toBe(currentSlide);
                currentSlide = fixture.componentInstance.viewChild.get(0);
                fixture.componentInstance.viewChild.prev();
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.get(0)).toBe(currentSlide);
                done();
            });
        });
        it("Carousel emit events", (done) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {
                fixture.detectChanges();
                let carousel = fixture.componentInstance.viewChild;
                let native = fixture.nativeElement;
                spyOn(carousel.slideChanged, 'emit');
                carousel.next();
                fixture.detectChanges();
                expect(carousel.slideChanged.emit).toHaveBeenCalledWith(carousel);
                spyOn(carousel.slideAdded, 'emit');
                carousel.add(carousel.get(carousel.current));
                fixture.detectChanges();
                expect(carousel.slideAdded.emit).toHaveBeenCalledWith(carousel);
                spyOn(carousel.slideRemoved, 'emit');
                carousel.remove(carousel.get(carousel.current));
                fixture.detectChanges();
                expect(carousel.slideRemoved.emit).toHaveBeenCalledWith(carousel);
                spyOn(carousel.carouselPaused, 'emit');
                carousel.stop();
                fixture.detectChanges();
                expect(carousel.carouselPaused.emit).toHaveBeenCalledWith(carousel);
                spyOn(carousel.carouselPlaying, 'emit');
                carousel.play();
                fixture.detectChanges();
                expect(carousel.carouselPlaying.emit).toHaveBeenCalledWith(carousel);
                done();
            });
        });
        it('Carousel click handlers', (done) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {
                fixture.detectChanges();
                let prevNav, nextNav, carousel, carouselNative;
                carouselNative = fixture.componentInstance.viewChild.element_ref.nativeElement;
                carousel = fixture.componentInstance.viewChild;
                prevNav = carouselNative.querySelector('a.left');
                nextNav = carouselNative.querySelector('a.right');
                spyOn(carousel, 'prev');
                dispatchEv(prevNav, 'click');
                fixture.detectChanges();
                expect(carousel.prev).toHaveBeenCalled();
                spyOn(carousel, 'next');
                dispatchEv(nextNav, 'click');
                fixture.detectChanges();
                expect(carousel.next).toHaveBeenCalled();
                done();
            });
        });
        it('Carousel keyboard handlers', (done) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {
                fixture.detectChanges();
                let carousel, carouselNative;
                carouselNative = fixture.componentInstance.viewChild.element_ref.nativeElement;
                carousel = fixture.componentInstance.viewChild;
                carousel.pause = true;
                fixture.detectChanges();
                spyOn(carousel, 'prev');
                carouselNative.dispatchEvent(new KeyboardEvent('keydown', { key: "ArrowLeft" }));
                fixture.detectChanges();
                expect(carousel.prev).toHaveBeenCalled();
                spyOn(carousel, 'next');
                carouselNative.dispatchEvent(new KeyboardEvent('keydown', { key: "ArrowRight" }));
                fixture.detectChanges();
                expect(carousel.next).toHaveBeenCalled();
                done();
            });
        });
    });
}
exports.main = main;
let CarouselTestComponent = class CarouselTestComponent {
    constructor() {
        this.loop = true;
        this.pause = false;
        this.swipes_left = 0;
        this.swipes_right = 0;
        this.interval = 2500;
        this.taps = 0;
    }
};
__decorate([
    core_1.ViewChild(Infragistics.Carousel), 
    __metadata('design:type', Infragistics.Carousel)
], CarouselTestComponent.prototype, "viewChild", void 0);
CarouselTestComponent = __decorate([
    core_1.Component({
        selector: 'test-cmp',
        template: `<ig-carousel [loop]="loop" [pause]="pause" [interval]="interval">
                    <ig-slide></ig-slide>
                    <ig-slide></ig-slide>
                </ig-carousel>`,
        directives: [
            Infragistics.Carousel,
            Infragistics.Slide
        ]
    }), 
    __metadata('design:paramtypes', [])
], CarouselTestComponent);

//# sourceMappingURL=carousel.spec.js.map
