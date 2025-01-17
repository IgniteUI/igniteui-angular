import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef } from '@angular/core';
import { IGX_CAROUSEL_DIRECTIVES, IgxIconComponent } from 'igniteui-angular';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';
import {
    IgcButtonComponent,
    IgcCarouselComponent,
    IgcIconComponent,
    IgcInputComponent,
    IgcTextareaComponent,
    defineComponents,
    registerIconFromText,
} from 'igniteui-webcomponents';
import { NgClass } from '@angular/common';

defineComponents(
    IgcCarouselComponent,
    IgcIconComponent,
    IgcInputComponent,
    IgcButtonComponent,
    IgcTextareaComponent
);

const icons = [
    {
        name: 'previous',
        text: '<svg fill="#000000" width="24" height="24" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M0 220.8C0 266.416 37.765 304 83.2 304h35.647a93.148 93.148 0 0 0 7.929 22.064c-2.507 22.006 3.503 44.978 15.985 62.791C143.9 441.342 180.159 480 242.701 480H264c60.063 0 98.512-40 127.2-40h2.679c5.747 4.952 13.536 8 22.12 8h64c17.673 0 32-12.894 32-28.8V188.8c0-15.906-14.327-28.8-32-28.8h-64c-8.584 0-16.373 3.048-22.12 8H391.2c-6.964 0-14.862-6.193-30.183-23.668l-.129-.148-.131-.146c-8.856-9.937-18.116-20.841-25.851-33.253C316.202 80.537 304.514 32 259.2 32c-56.928 0-92 35.286-92 83.2 0 8.026.814 15.489 2.176 22.4H83.2C38.101 137.6 0 175.701 0 220.8zm48 0c0-18.7 16.775-35.2 35.2-35.2h158.4c0-17.325-26.4-35.2-26.4-70.4 0-26.4 20.625-35.2 44-35.2 8.794 0 20.445 32.712 34.926 56.1 9.074 14.575 19.524 27.225 30.799 39.875 16.109 18.374 33.836 36.633 59.075 39.596v176.752C341.21 396.087 309.491 432 264 432h-21.299c-40.524 0-57.124-22.197-50.601-61.325-14.612-8.001-24.151-33.979-12.925-53.625-19.365-18.225-17.787-46.381-4.95-61.05H83.2C64.225 256 48 239.775 48 220.8zM448 360c13.255 0 24 10.745 24 24s-10.745 24-24 24-24-10.745-24-24 10.745-24 24-24z"/></svg>',
    },
    {
        name: 'next',
        text: `<svg fill="#000000" width="24" height="24" viewBox="0 0 589.308 589.308" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
      <path d="M503.587,148.307c-47.736-34.885-96.696-87.517-154.225-104.652c-5.508-1.836-9.18,1.836-10.403,6.12
      c-3.672,1.836-6.732,4.896-6.732,10.404c-1.836,39.168-1.836,78.947-1.224,118.115c-49.572-1.224-99.145-1.836-149.328-1.224
      c-34.272,0.612-128.52-7.956-156.06,22.032c-4.896-1.225-10.404,1.224-12.852,6.731c-18.36,45.288-12.24,102.816-9.792,151.164
      c2.448,56.916,6.12,113.832,11.016,170.748c0,2.448,1.224,4.284,2.448,5.508c0,3.061,2.448,6.12,7.344,6.732
      c41.616,6.731,90.576,9.792,131.58-0.612c11.016-2.448,11.016-15.3,4.284-20.808c17.748-58.141-7.344-118.116,5.508-176.868
      c55.692,3.672,112.608,1.224,168.912-1.836c0,29.988-1.224,59.976-3.672,89.964c0,1.224,0,2.448,0.612,3.672
      c-0.612,2.448-0.612,4.284-1.225,6.732c-1.224,7.956,5.509,18.972,15.301,15.3c59.363-23.256,105.264-57.528,154.224-96.696
      c34.271-27.54,87.516-66.096,89.964-114.443C591.103,204.61,530.515,167.891,503.587,148.307z"/>
      </svg>`,
    },
];

icons.forEach((icon) => {
    registerIconFromText(icon.name, icon.text, 'material');
});

@Component({
    selector: 'app-carousel-sample',
    styleUrls: ['carousel.sample.scss'],
    templateUrl: 'carousel.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IGX_CAROUSEL_DIRECTIVES, IgxIconComponent, NgClass]
})
export class CarouselSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        disableLoop: {
            label: 'Disable Loop',
            control: {
                type: 'boolean'
            }
        },
        disablePauseOnInteraction: {
            label: 'Disable Pause on Interaction',
            control: {
                type: 'boolean'
            }
        },
        hideNavigation: {
            label: 'Hide Navigation',
            control: {
                type: 'boolean'
            }
        },
        hideIndicators: {
            label: 'Hide Indicator',
            control: {
                type: 'boolean'
            }
        },
        vertical: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        indicatorTemplate: {
            label: 'Show Template',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        interval: {
            control: {
                type: 'number',
                min: 500
            }
        },
        animationType: {
            label: 'Animation Type',
            control: {
                type: 'button-group',
                options: ['slide', 'fade', 'none'],
                defaultValue: 'slide'
            }
        },
        indicatorsOrientation: {
            label: 'Indicators Orientation',
            control: {
                type: 'button-group',
                options: ['top', 'bottom'],
                defaultValue: 'bottom'
            }
        },
        maximumIndicatorsCount: {
            label: 'Maximum Indicators Count',
            control: {
                type: 'number',
                defaultValue: 10
            }
        }
    }

    public properties: Properties;

    constructor(
        private propertyChangeService: PropertyChangeService,
        private destroyRef: DestroyRef
    ) {
        this.addNewSlide();
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        const { unsubscribe } =
            this.propertyChangeService.propertyChanges.subscribe(
                (properties) => {
                    this.properties = properties;
                }
            );

        this.destroyRef.onDestroy(() => unsubscribe);
    }

    private indicatorsOrientationMap = new Map<string, string>([
        ['top', 'start'],
        ['bottom', 'end'],
    ]);

    protected get wcIndicatorsOrientation() {
        const orientation = this.propertyChangeService.getProperty(
            'indicatorsOrientation'
        );
        return this.indicatorsOrientationMap.get(orientation) || 'end';
    }

    public slides = [];

    public addNewSlide() {
        this.slides.push(
            { image: 'assets/images/carousel/slide1@x2.jpg', active: true },
            { image: 'assets/images/carousel/slide2@x2.jpg', active: false },
            { image: 'assets/images/carousel/slide3@x2.jpg', active: false }
        );
    }
}
