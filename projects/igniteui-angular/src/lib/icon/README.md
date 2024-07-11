# igx-icon

**igx-icon** supports icon component that unifies various icon/font sets to allow their usage interchangeably.

With the igx-icon you can add **material-icons** and other font-based icon sets while also using custom SVG icons in your markup.
A guide on how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/icon)

# Usage

```html
    <igx-icon family="material" name="home"></igx-icon>
```

You can set the family to `family="material"` to select the material icons set (default).

You can set the icon by providing its name from the official [material icons set](https://material.io/icons/) `name="home"`.

You can set the icon to active/inactive by providing setting `active` to true or false (default is true).

You can access all properties of the icon component with the following attributes:

`id`

`family`

`name`

`active`


**Setters**
You can programmatically set all of the icon properties with the following icon setters: 

`family(fontFamily: string)` sets the icon family
`name(icon: string)` sets the icon name
`active(state: boolean)` sets the icon style to inactive if set the false

**Getters**
You can programmatically get all of the icon properties with the following icon getters: 

`getFamily()` returns the icon family.
`getName()` returns the icon name.
`getActive()` returns the icon's active state.
