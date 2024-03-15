import { ElementRef, Inject, Injectable, Input } from '@angular/core';
import { mkenum } from '../../core/utils';
import { Subject, Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';

const Theme = /*@__PURE__*/mkenum({
  Material: 'material',
  Fluent: 'fluent',
  Bootstrap: 'bootstrap',
  IndigoDesign: 'indigo-design'
});

/**
 * Determines the component theme.
 */
export type IgxTheme = (typeof Theme)[keyof typeof Theme];

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public _theme: IgxTheme;
  private _theme$ = new Subject();
  private _subscription: Subscription;

  /**
   * Sets the theme of the component.
   * Allowed values of type IgxTheme.
   */
  @Input()
  public set theme(value: IgxTheme) {
    this._theme = value;
  }

  /**
   * Returns the theme of the component.
   * The returned value is of type IgxTheme.
   */
  public get theme(): IgxTheme {
    return this._theme;
  }

  constructor(
    @Inject(DOCUMENT)
    private document: any
  ) { 
    this._subscription = this._theme$.asObservable().subscribe(value => {
      this._theme = value as IgxTheme;
    });
  }

  public getCssProp(element: ElementRef) {
    if (!this._theme) {
      const cssProp = this.document.defaultView
          .getComputedStyle(element.nativeElement)
          .getPropertyValue('--theme')
          .trim();

      if (cssProp !== '') {
          Promise.resolve().then(() => {
              this._theme$.next(cssProp);
          });
      }
    }
  }
}
