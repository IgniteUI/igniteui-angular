# igx-icon

**igx-icon** supports icon component that unifies various icon/font sets to allow their usage interchangeably.

With the igx-icon you can add **material-icons** and custom SVG icons in your markup.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/icon)

# Usage

```html
    <igx-icon family="material" active="false">home</igx-icon>
```

You can set the family to `family="material"` to select the material icons set (default). More to be added later.

You can set the icon by providing its name from the official [material icons set](https://material.io/icons/) `name="home"`.

You can set the icon to active/inactive by providing setting `active="true"` to true or false (default is true).


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

`getFamily()` returns the icon family 
`getColor()` returns the icon color
`getName()` returns the icon name
`getActive()` returns the icon active state
`getSvgKey()` returns the key of a custom SVG icon. The SVG key is a combination between the family and icon name
