## Ignite UI for Angular Themes

Ignite UI for Angular includes a comprehensive set of **<a href="http://sass-lang.com/" target="_blank">Sass</a>** functions and mixins, giving you the power to easily style your entire application or only certain parts of it.

### The Essence of a Theme

Since **IgniteUI for Angular** bases its component designs on the **<a href="https://material.io/guidelines/material-design/introduction.html" target="_blank">Material Design Guidelines</a>**, we try to get as close as possible to colors, sizes, and overall look and feel of our components to those created by Google.

Our approach to theming is based around several simple concepts.

#### Palettes

The first concept is the one of palettes of colors. As in any visual tool, colors are the main differentiator between one application and another. The Material Design Guidelines prescribe predefined palettes of colors that range in hue and lightness for a base color. There's a good reason for that. They really want to ensure good color matching and contrast between the background colors and the foreground text colors. This is great, but limiting at the same time. If you wanted to have your own custom palette that matches your branding, you would be out of luck. We recognize this is a problem, so we invented an algorithm that would generate Material-like palettes from base colors you provide. Even more, we also generate contrast text colors for each hue in the palette.

#### Themes

The second concept is the one of themes. Palettes, wouldn't do much good if they weren't used by a theme. So we have themes for each component, and a global one, that styles the entire application and every component in it. You simply pass your generated palette to the global theme, we take care of the rest. You can, of course, style each component individually to your liking. We will take a closer look at how to do that later in this article.

#### Typography

The last concept revolves around typography. Although we have a default typeface choice, we really want to give you the power to style your application in every single way. Typography is such an important part of that. We provide a method for changing the font family, the sizes and weights for headings, subheadings and paragraph texts in your app.

### Generating Color Palettes

Our theming library is based on Sass. If you used the **<a href="https://github.com/IgniteUI/igniteui-cli" target="_blank">Ignite UI CLI</a>** to bootstrap your app, you can specify the style extentsion in the **angular-cli.json** config to _scss_, the CLI will take care of compiling the Sass styles for you. If you haven't used Ignite UI CLI then you have to configure your builder to compile Sass styles for you.

Our palettes accept arguments for `primary`, `secondary`, `info`, `success`, `warn`, and `error` colors. The primary color is the one that will be the more prominent color throughout your application. The secondary color is the one used on elements that are actionable, such as buttons, switches, sliders, etc. The only required arguments we require, though, are the ones for `primary` and `secondary` colors. We default the ones for `info`, `success`, `warn`, and `error` to a predefined set of our choosing.

To get started with our first color palette, create an _scss_ file that would be the base file for your global theme. I will call mine _"my-app-theme.scss"_.

```scss
// Import the IgniteUI themes library first
@import "~igniteui-angular/core/styles/themes/index";

$company-color: #2ab759; // Some green shade I like
$secondary-color: #f96a88; // Watermelon pink

$my-color-palette: igx-palette(
  $primary: $company-color,
  $secondary: $secondary-color
);
```

Now we have a palette, that contains exactly 74 colors! Whoa, wait, what? How did that happen? You provided 2 and got 74? Where did the other 72 colors come from?
Let's stop here to explain what just happened as it's quite important. When you provided `primary` and `secondary` colors, we took those and generated shades and accent colors for each one. Basically now in your palette you have 2 sub-palettes for `primary` and `secondary` colors. Each sub-palette contains 12 additional color variations based on the original color. 4 of the 12 colors are lighter shades of your original color, and 4 are darker. The remaining 4 colors are more exaggerated 'accent' versions of the original color. With the original color that makes for a total of 13 colors in each palette.

With so many colors in each sub-palette you may be wondering, how on Earth will I know which one is which, right? It's quite simple, really. Each of the colors in the sub-palette has a number. We assign the number `500` to the original color. The lighter shades start from `100` and range to `400`. The darker shades start from `600` and range to `900`. The accent colors have string names `A100`, `A200`, `A400`, and `A700`, respectively. Okay, but now that's only 26 out of 72. Don't worry, there's another sub-palette we give you. One that consists of gray 'colors', called `grays`. It's just like the other two color sub-palettes, but doesn't include any accent variations. Good, now we're up to 26 + 9 for a total of 35 colors. That is still a long way from 74. Where do the other 39 colors come from? Let's solve the final puzzle. Remember you can also have 4 additonional colors for `info`, `success`, `warn` and `error`. So that leaves another 35 colors unaccounted for. Remember the count for the `primary`, `secondary`, and `grays` sub-palettes was exactly 35? The other 35 remaining colors are contrast text colors for each of the colors in the `primary`, `secondary`, and `grays` sub-palettes.

Got it? Good! But how does one access any of the colors in the palette?

#### Getting Sub-Palette Colors

We provide a function that is easy to remember and use `igx-color`. It takes three arguments - `palette`, `color`, and `variant`;

```scss
$my-primary-600: igx-color($my-palette, "primary", 600);
$my-primary-A700: igx-color($my-palette, "secondary", "A700");
$my-warning-color: igx-color($my-palette, "warn");
// sample usage

.my-awesome-class {
  background: $my-primary-600;
  border-color: $my-primary-A700;
}

.warning-bg {
  background: $my-warning-color;
}
```

#### Getting Contrast Text Colors

Similar to how we get sub-palette colors, there's a way to get the contrast text color for each of the colors in the sub-palettes.

```scss
$my-primary-800: igx-color($my-palette, "primary", 600);
$my-primary-800-text: igx-contrast-color($my-palette, "primary", 600);
// sample usage

.my-awesome-article {
  background: $my-primary-800;
  color: $my-primary-800-text;
}
```

### Generating a Theme

If you've included the _"igniteui-angular.css"_ file in your application project, now is a good time to remove it. We are going to use our own _"my-app-theme.scss"_ file to generate our own theme.

Let's start from our very first example on this page. This time, though, we're going to be including two mixins `igx-core` and `igx-theme`; For now `igx-core` doesn't accept any arguments. `igx-theme`, however, does accept 2 - `$palette` and `$exclude`. For now, we'll only talk about the `$palette` argument. We'll take a deeper look at what `$exclude` does later on when we talk about individual component themes.

```scss
// Import the IgniteUI themes library first
@import "~igniteui-angular/lib/core/styles/themes/index";

$company-color: #2ab759; // Some green shade I like
$secondary-color: #f96a88; // Watermelon pink

$my-color-palette: igx-palette(
  $primary: $company-color,
  $secondary: $secondary-color
);

// IMPORTANT: Make sure you always include igx-core first!
@include igx-core();
// Pass the color palette we generated to the igx-theme mixin
@include igx-theme($my-color-palette);
```

That's it. Your application will now use the colors from your newly generated palette.

### Customizing Typography (WIP)

In its current state, the defining custom typography is limited to changing the `font family` of the application. We'll be updating this functionallity with subsequent releases. Our intent is to provide a robust way to customize the typography in your application.

To customize the typography use the `igx-typography` mixin. It takes exactly one argument - `config`.

```scss
// Import the IgniteUI themes library first
@import "~igniteui-angular/core/styles/themes/index";
// IMPORTANT: Make sure you always include igx-core first!
@include igx-core();
@include igx-theme($default-theme);

//Include after igx-core
@include igx-typography($config: (font-family: "Comic Sans MS"));
```
