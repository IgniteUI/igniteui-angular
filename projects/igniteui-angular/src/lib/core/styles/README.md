## Ignite UI for Angular Themes

### Overview
Since **IgniteUI for Angular** bases its component designs on the **<a href="https://material.io/guidelines/material-design/introduction.html" target="_blank">Material Design Principles</a>**, we try to get as close as possible to colors, sizes, typography, and overall look and feel of our components to those created by Google.

Our approach to theming is based around several simple concepts.

The Ignite UI for Angular theming library is based on [**Sass**](https://sass-lang.com). If you used the **<a href="https://github.com/IgniteUI/igniteui-cli" target="_blank">Ignite UI CLI</a>** to bootstrap your app, you can specify the style in the **angular.json** config to _scss_, the CLI will take care of compiling the Sass styles for you. If you haven't used Ignite UI CLI then you have to configure your builder to compile Sass styles for you.

### Palettes

The first concept is the one of palettes of colors. As in any visual tool, colors are the main differentiating factor between one application and another. The Material Design Guidelines prescribe predefined palettes of colors that range in hue and lightness for a base color. There's a good reason for that. They really want to ensure good color matching and contrast between the background colors and the foreground text colors. This is great, but limiting at the same time. If you wanted to have your own custom palette that matches your branding, you would be out of luck. We recognize this is a problem, so we invented an algorithm that would generate Material-like palettes from base colors you provide. Even more, we also generate contrast text colors for each hue in the palette.


### Schemas

The second important concept revolves around theme schemas. Theme schemas are like recipes for component themes. They give individual component themes information about colors, margins, paddings, etc. For instance, a component scheme tells a component theme that the background color for an element should be the `500` variant from the `primary` palette, without caring what palette the user passes to the component theme.


### Themes

Finally, we have component themes. Palettes and Schemas wouldn't do much good on their own if they weren't used by a theme. We have themes for individual components, and a global one, that styles the entire application and every component in it. You simply pass a palette and a schema to the global theme, we take care of the rest. You can, of course, style each component individually to your liking.

### Typography

Typography is a separate module in our Sass theming framework, which is decoupled from the component themes. Although we have a default typeface of choice, we really want to give you the power to style your application in every single way. Typography is such an important part of that. We provide a method for changing the font family, the sizes and weights for headings, subheadings, buttons, body text, etc. in your app.

### Additional Resources

Learn how to create themes:

* [Global Themes](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/global-theme.html)
* [Component Themes](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/component-themes.html)

Learn how to create a component schema:
* [Schemas](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/schemas.html)

Learn how to build color palettes:
* [Palettes](https://www.infragistics.com/products/ignite-ui-angular/angular/components/themes/palette.html)

Our community is active and always welcoming to new ideas.

* [Ignite UI for Angular **Forums**](https://www.infragistics.com/community/forums/f/ignite-ui-for-angular)
* [Ignite UI for Angular **GitHub**](https://github.com/IgniteUI/igniteui-angular)
