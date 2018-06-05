# igx-toast

**igx-toast** IgxToast provides information and warning messages. They could not be dismissed, are non-interactive and can appear on top, middle and the bottom of the screen.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/toast.html)

# Usage

## Simple Toast

```html
<button (click)="toast.show()">Show toast</button>
<button (click)="toast.hide()">Hide toast</button>

<igx-toast #toast
           message="Something happened!">
</igx-toast>
```
You can set the id of the component by `id="myToast"` or will be automatically generated;

You can be more descriptive and set message `message="Something happened!"`.

You can show the toast by using `toast.show()` method.

You can show hide toast by using `toast.hide()` method.

## Toast positioned on top

```html
<button (click)="toast.show()">Show toast</button>

<igx-toast #toast
           message="Something happened!"
           position="IgxToastPosition.Top">
</igx-toast>
```

You can modify the position of the toast by setting `postion="IgxToastPosition.Top"`.

## Toast with events

```html
<button (click)="toast.show()">Show toast</button>

<igx-toast #toast
           message="Something happened!"
           (onShowing)="onToastShowing($event)"
           (onShown)="onToastShown($event)"
           (onHiding)="onToastShowing($event)"
           (onHidden)="onToastHidden($event)">
</igx-toast>
```

You can handle the onShowing event by using `(onShowing)="someFunc($event)"`.
You can handle the onShown event by using `(onShowing)="someFunc($event)"`.
You can handle the onHiding event by using `(onHiding)="someFunc($event)"`.
You can handle the onHidden event by using `(onHidden)="someFunc($event)"`.
