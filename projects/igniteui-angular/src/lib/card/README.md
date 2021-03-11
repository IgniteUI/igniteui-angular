# igx-card

A walk-through of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/card.html)

**igx-card** is a sheet of material that serves as an entry point to more detailed information. The cards in Ignite UI for Angular can be composed using the `igx-card-media`, `igx-card-header`, `igx-card-content`, and `igx-card-actions` components and directives. Those card elements ensure aesthetically pleasing design that conforms to the Material Design guidelines.

Supporting directives and components:
**igx-card-media** is a container for images, videos, or any other type of media; It ensures the content placed inside is sized correctly.
**igx-card-header** is the place to put your `igxCardHeaderTitle`, `igxCardHeaderSubtitle`, and `igxCardHeaderThumbnail`; It will also detect `igx-avatar` components and place them in the thumbnail area for you.
**igx-card-content** is used to wrap any layout you want to appear in the content area of the `igx-card`;
**igx-card-actions** will organize all `igxButton` tagged elements placed in it automatically.

# Usage
```html
<igx-card>
    <igx-card-header>
        <igx-avatar src="https://upload.wikimedia.org/wikipedia/commons/4/49/Elon_Musk_2015.jpg" [roundShape]="true"></igx-avatar>
        <h4 igxCardHeaderTitle>Elon Musk</h4>
        <h5 igxCardHeaderSubtitle>Entrepreneur</h5>
    </igx-card-header>

    <igx-card-media>
        <img src="https://2pobaduekzw9jt9a-zippykid.netdna-ssl.com/wp-content/uploads/2017/01/elon-musk.jpg">
    </igx-card-media>

    <igx-card-content>
        <p>South African entrepreneur Elon Musk is known for founding Tesla Motors and SpaceX, which launched a landmark commercial spacecraft in 2012.</p>
    </igx-card-content>

    <igx-card-actions>
        <button igxButton (click)="openUrl('https://www.facebook.com/pages/Elon-Musk/108250442531979')">Like</button>
        <button igxButton (click)="openUrl('https://twitter.com/elonmusk')">Share</button>
    </igx-card-actions>
</igx-card>
```
# API Summary 

## igx-card
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `id` | string | Unique identifier of the component. If not provided it will be automatically generated.|
| `type` | IgxCardType | The type of the card component. It can be either `elevated` or `outlined`. |
| `role` | string | The role attribute of the card. By default it's set to `group`. |
| `isCardOutlined` | boolean | Returns `true` if the card is outlined. |
| `horizontal`* | boolean | Sets the card layout direction. When set to `true` the card content is horizontally layed out. |

## igx-card-header
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `role` | string | The role attribute of the card header. By default it's set to `header`. |
| `vertical` | boolean | Sets the header layout direction. When set to `true` the card content is vertically layed out. |

## igx-card-media
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `role` | string | The role attribute. By default it's set to `img`. |
| `width` | string | Sets the width property. |
| `height` | string | Sets the height property. |

## igx-card-actions
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `layout` | IgxCardActionsLayout | Sets the layout type of the area. Can be either `start` or `justify`. |
| `vertical` | boolean | Sets the layout direction. When set to `true` all buttons in the area will be aligned vertically. |
| `reverse` | boolean | Reverses the layout of the area. When set to `true` all `igx-icons` and/or `igx-button='icon` will appear before all regular(text) buttons. |
| `isJustifyLayout` | boolean | Returns true when the layout type is set to `justify`. |


`*` When the `horizontal` property of the card is set to `true`, any `igx-card-actions` between the opening and closing brackets of the `igx-card` component will automatically have their `vertical` property set to true.

`**` The `igx-card-content` is just a container for the content placed in it. It is used as a layout hook so that whe can arrange it correctly with respect to all other card elements.
