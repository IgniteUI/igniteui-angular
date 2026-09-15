# Data Display & Other UI Components

> **Part of the [`igniteui-angular-components`](../SKILL.md) skill hub.**
> For app setup, providers, and import patterns — see [`setup.md`](./setup.md).

## Contents

- [List](#list)
- [Tree](#tree)
- [Card](#card)
- [Chips](#chips)
- [Avatar & Badge](#avatar--badge)
- [Icon](#icon)
- [Carousel](#carousel)
- [Paginator](#paginator)
- [Progress Indicators](#progress-indicators)
- [Chat (AI Chat Component)](#chat-ai-chat-component)

## List

```typescript
import { IGX_LIST_DIRECTIVES } from 'igniteui-angular/list';
import { IgxAvatarComponent } from 'igniteui-angular/avatar';
import { IgxIconComponent } from 'igniteui-angular/icon';
```

```html
<igx-list>
  <igx-list-item [isHeader]="true">Contacts</igx-list-item>
  @for (contact of contacts; track contact.id) {
    <igx-list-item>
      <igx-avatar igxListThumbnail [src]="contact.avatar" shape="circle"></igx-avatar>
      <span igxListLineTitle>{{ contact.name }}</span>
      <span igxListLineSubTitle>{{ contact.phone }}</span>
      <igx-icon igxListAction (click)="call(contact)">phone</igx-icon>
    </igx-list-item>
  }
</igx-list>
```

Auxiliary directives for list items: `igxListThumbnail`, `igxListAction`, `igxListLine`, `igxListLineTitle`, `igxListLineSubTitle`.

## Tree

```typescript
import { IGX_TREE_DIRECTIVES } from 'igniteui-angular/tree';
```

```html
<igx-tree selection="BiState" (nodeSelection)="onNodeSelect($event)">
  @for (node of treeData; track node.id) {
    <igx-tree-node [data]="node" [expanded]="node.expanded">
      <igx-icon>folder</igx-icon>
      {{ node.label }}
      @for (child of node.children; track child.id) {
        <igx-tree-node [data]="child">
          <igx-icon>description</igx-icon>
          {{ child.label }}
        </igx-tree-node>
      }
    </igx-tree-node>
  }
</igx-tree>
```

Selection modes: `'None'`, `'BiState'`, `'Cascading'`.

## Card

```typescript
import { IgxCardComponent, IgxCardHeaderComponent, IgxCardContentDirective, IgxCardActionsComponent, IgxCardMediaDirective, IgxCardHeaderTitleDirective, IgxCardHeaderSubtitleDirective, IgxCardThumbnailDirective } from 'igniteui-angular/card';
import { IgxAvatarComponent } from 'igniteui-angular/avatar';
import { IgxButtonDirective, IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IgxRippleDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
```

```html
<igx-card>
  <igx-card-media height="200px">
    <img [src]="article.coverImage" />
  </igx-card-media>
  <igx-card-header>
    <!-- igx-avatar inside igx-card-header is auto-detected as thumbnail -->
    <igx-avatar [src]="author.photo" shape="circle"></igx-avatar>
    <h3 igxCardHeaderTitle>{{ article.title }}</h3>
    <h5 igxCardHeaderSubtitle>{{ author.name }}</h5>
  </igx-card-header>
  <igx-card-content>
    <p>{{ article.excerpt }}</p>
  </igx-card-content>
  <igx-card-actions>
    <button igxButton="flat" igxRipple>Read More</button>
    <button igxIconButton="flat" igxRipple>
      <igx-icon>favorite</igx-icon>
    </button>
  </igx-card-actions>
</igx-card>
```

## Chips

```typescript
import { IgxChipComponent, IgxChipsAreaComponent } from 'igniteui-angular/chips';
```

```html
<igx-chips-area (reorder)="onChipsReorder($event)">
  @for (tag of tags; track tag) {
    <igx-chip [removable]="true" [selectable]="true" (remove)="removeTag(tag)">
      {{ tag }}
    </igx-chip>
  }
</igx-chips-area>
```

## Avatar & Badge

```typescript
import { IgxAvatarComponent } from 'igniteui-angular/avatar';
import { IgxBadgeComponent } from 'igniteui-angular/badge';
```

```html
<!-- Image avatar with badge overlay -->
<div class="avatar-badge-container">
  <igx-avatar [src]="user.photo" shape="circle" size="large"></igx-avatar>
  <igx-badge [type]="'success'" [icon]="'check'"></igx-badge>
</div>

<!-- Initials avatar -->
<igx-avatar initials="JD" shape="circle"></igx-avatar>

<!-- Icon avatar -->
<igx-avatar icon="person"></igx-avatar>

<!-- Standalone badge -->
<igx-badge [type]="'error'" [value]="unreadCount"></igx-badge>
```

```scss
// Required styles to position the badge as an overlay on the avatar
.avatar-badge-container {
  position: relative;
  display: inline-flex;

  igx-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    transform: translate(25%, 25%);
  }
}
```

Avatar shapes: `'circle'`, `'rounded'`, `'square'`. Sizes: `'small'`, `'medium'`, `'large'`, or custom CSS.
Badge types: `'primary'`, `'info'`, `'success'`, `'warning'`, `'error'`.

## Icon

```typescript
import { IgxIconComponent, IgxIconService } from 'igniteui-angular/icon';
```

```html
<!-- Material icon (default ligature-based) -->
<igx-icon>settings</igx-icon>
<igx-icon color="#e41c77">favorite</igx-icon>

<!-- SVG icon from a registered custom family -->
<igx-icon [family]="'my-icons'" [name]="'logo'"></igx-icon>
```

Register custom SVG icons in a service or component constructor:

```typescript
export class AppComponent {
  constructor() {
    const iconService = inject(IgxIconService);
    // From inline SVG string
    iconService.addSvgIconFromText('logo', '<svg xmlns="..." viewBox="...">...</svg>', 'my-icons');
    // From URL
    iconService.addSvgIcon('arrow', '/assets/icons/arrow.svg', 'my-icons');
  }
}
```

## Carousel

```typescript
import { IgxCarouselComponent, IgxSlideComponent } from 'igniteui-angular/carousel';
```

```html
<igx-carousel [interval]="3000" [pause]="true" [loop]="true" [navigation]="true">
  @for (slide of slides; track slide.id) {
    <igx-slide>
      <img [src]="slide.image" [alt]="slide.alt" />
      <div class="slide-caption">{{ slide.caption }}</div>
    </igx-slide>
  }
</igx-carousel>
```

> **Important:** Carousel uses Angular animations — ensure `provideAnimations()` is present in `app.config.ts`.

## Paginator

```typescript
import { IgxPaginatorComponent } from 'igniteui-angular/paginator';
```

```html
<igx-paginator
  [totalRecords]="totalItems()"
  [perPage]="pageSize()"
  [selectOptions]="[5, 10, 25, 50]"
  (perPageChange)="onPageSizeChange($event)"
  (pageChange)="onPageChange($event)">
</igx-paginator>
```

> **NOTE:** For grid paging, attach `<igx-paginator>` inside the grid element. See [`../../igniteui-angular-grids/references/paging-remote.md`](../../igniteui-angular-grids/references/paging-remote.md) for grid-specific paging patterns.

## Progress Indicators

```typescript
import { IgxLinearProgressBarComponent } from 'igniteui-angular/progressbar';
import { IgxCircularProgressBarComponent } from 'igniteui-angular/progressbar';
```

```html
<!-- Linear progress bar -->
<igx-linear-bar
  [value]="uploadProgress()"
  [max]="100"
  [type]="'info'"
  [striped]="true"
  [animate]="true"
  [textVisibility]="true">
</igx-linear-bar>

<!-- Circular progress (determinate) -->
<igx-circular-bar [value]="65" [max]="100" [animate]="true"></igx-circular-bar>

<!-- Circular progress (indeterminate) -->
<igx-circular-bar [indeterminate]="true"></igx-circular-bar>
```

Types for linear bar: `'default'`, `'info'`, `'success'`, `'warning'`, `'error'`.

## Chat (AI Chat Component)

> **Full doc in the MCP:** `get_doc({ framework: "angular", name: "chat" })` covers messages, attachments, quick replies, typing indicators, templates, and styling. Prefer it over writing chat code from memory.

```typescript
import { IgxChatComponent, IgxChatMessageContextDirective, type IgxChatOptions } from 'igniteui-angular/chat';
import { MarkdownPipe } from 'igniteui-angular/chat-extras'; // template usage: message.text | fromMarkdown | async
```

Gotchas not obvious from the doc:

- The markdown pipe class is `MarkdownPipe` (from `igniteui-angular/chat-extras`) but its template name is `fromMarkdown`, and it is async — combine with `AsyncPipe`.
- Custom templates (`messageHeader`, `messageContent`, `suggestionPrefix`, …) are passed as one object via the `[templates]` input — collect the `ng-template` refs with `viewChild` and assemble the object in an `effect()` (or `computed()`).

## See Also

- [`setup.md`](./setup.md) — App providers, architecture, all entry points
- [`form-controls.md`](./form-controls.md) — Input Group, Combo, Select, Date/Time Pickers, Calendar, Checkbox, Radio, Switch, Slider
- [`layout.md`](./layout.md) — Tabs, Stepper, Accordion, Splitter, Navigation Drawer
- [`feedback.md`](./feedback.md) — Dialog, Snackbar, Toast, Banner
- [`directives.md`](./directives.md) — Button, Ripple, Tooltip, Drag and Drop
- [`../../igniteui-angular-grids/references/paging-remote.md`](../../igniteui-angular-grids/references/paging-remote.md) — Grid-specific paginator usage
