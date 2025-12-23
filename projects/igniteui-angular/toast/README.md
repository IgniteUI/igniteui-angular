# igx-toast

The Toast component shows application messages in a stylized pop-up box positioned inside the global overlay outlet(default). Toasts can't be dismissed, they are non-interactive and can appear on top, middle, and the bottom of the screen. A walkthrough on how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/toast)

# Usage

## Simple Toast

```html
<button type="button" igxButton (click)="toast.open()">Show toast</button>
<button type="button" igxButton (click)="toast.close()">Hide toast</button>

<igx-toast #toast>Well, hi there!</igx-toast>
```

You can set the id of the component by setting the attribute `id` on the component (e.g. `id="myToast"`), or it will be automatically generated for you if you don't provide anything;

The toast can be shown by using the `open()` method.

You can hide the toast by using the `close()` method.

## Toast Position
You can set the `positon` property to `top`, `middle`, or `bottom`, which will position the toast near the top, middle, or bottom of the document*.

*By default the toast renders inside a global overlay outlet. You can specify a different overlay outlet by setting the `outlet` property on the toast;

```html
<button type="button" igxButton (click)="toast.open()">Show toast</button>
<igx-toast #toast position="top">Top Positioned Toast</igx-toast>
```

## Toast with different content

```html
<igx-toast #toast position="bottom">
    <igx-icon>notifications</igx-icon>
    This message will self-destruct in 4 seconds.
</igx-toast>
```

You can display various content by placing it between the `igx-toast` tags.

## Toast Events

```html
<button type="button" igxButton (click)="toast.open()">Show toast</button>

<igx-toast
    #toast
    message="Something happened!"
    (onShowing)="onToastShowing($event)"
    (onShown)="onToastShown($event)"
    (onHiding)="onToastShowing($event)"
    (onHidden)="onToastHidden($event)"
>
</igx-toast>
```

You can handle the onShowing event by using `(onShowing)="someFunc($event)"`.
You can handle the onShown event by using `(onShowing)="someFunc($event)"`.
You can handle the onHiding event by using `(onHiding)="someFunc($event)"`.
You can handle the onHidden event by using `(onHidden)="someFunc($event)"`.
