# Data Display & Other UI Components

> **Part of the [`igniteui-angular-components`](../SKILL.md) skill hub.**
> For app setup, providers, and import patterns — see [`setup.md`](./setup.md).

## List

> **Docs:** [List Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/list)

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
      <span igxListLine>{{ contact.name }}</span>
      <span igxListLineSubTitle>{{ contact.phone }}</span>
      <span igxListLineTitle>{{ contact.email }}</span>
      <igx-icon igxListAction (click)="call(contact)">phone</igx-icon>
    </igx-list-item>
  }
</igx-list>
```

Auxiliary directives for list items: `igxListThumbnail`, `igxListAction`, `igxListLine`, `igxListLineTitle`, `igxListLineSubTitle`.

## Tree

> **Docs:** [Tree Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tree)

```typescript
import { IGX_TREE_DIRECTIVES } from 'igniteui-angular/tree';
```

```html
<igx-tree [selection]="'BiCascade'" (nodeSelection)="onNodeSelect($event)">
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

Selection modes: `'None'`, `'BiCascade'`, `'Cascade'`.

## Card

> **Docs:** [Card Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/card)

```typescript
import { IgxCardComponent, IgxCardHeaderComponent, IgxCardContentDirective, IgxCardActionsComponent, IgxCardMediaDirective, IgxCardHeaderTitleDirective, IgxCardHeaderSubtitleDirective, IgxCardHeaderThumbnailDirective } from 'igniteui-angular/card';
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
    <igx-avatar igxCardHeaderThumbnail [src]="author.photo" shape="circle"></igx-avatar>
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

> **Docs:** [Chip Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/chip)

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

> **Docs:** [Avatar](https://www.infragistics.com/products/ignite-ui-angular/angular/components/avatar) · [Badge](https://www.infragistics.com/products/ignite-ui-angular/angular/components/badge)

```typescript
import { IgxAvatarComponent } from 'igniteui-angular/avatar';
import { IgxBadgeComponent } from 'igniteui-angular/badge';
```

```html
<!-- Image avatar with badge overlay -->
<igx-avatar [src]="user.photo" shape="circle" size="large">
  <igx-badge igxAvatarBadge [type]="'success'" [icon]="'check'"></igx-badge>
</igx-avatar>

<!-- Initials avatar -->
<igx-avatar initials="JD" shape="circle"></igx-avatar>

<!-- Icon avatar -->
<igx-avatar icon="person"></igx-avatar>

<!-- Standalone badge -->
<igx-badge [type]="'error'" [value]="unreadCount"></igx-badge>
```

Avatar shapes: `'circle'`, `'rounded'`, `'square'`. Sizes: `'small'`, `'medium'`, `'large'`, or custom CSS.
Badge types: `'default'`, `'info'`, `'success'`, `'warning'`, `'error'`.

## Icon

> **Docs:** [Icon Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/icon)

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

> **Docs:** [Carousel Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/carousel)

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

> **AGENT INSTRUCTION:** Carousel uses Angular animations — ensure `provideAnimations()` is present in `app.config.ts`.

## Paginator

> **Docs:** [Paginator Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/paginator)

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

> **Docs:** [Linear Progress](https://www.infragistics.com/products/ignite-ui-angular/angular/components/linear-progress) · [Circular Progress](https://www.infragistics.com/products/ignite-ui-angular/angular/components/circular-progress)

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

Types for linear bar: `'default'`, `'info'`, `'success'`, `'warning'`, `'danger'`.

## Chat (AI Chat Component)

> **Docs:** [Chat Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/chat)

```typescript
import { IgxChatComponent } from 'igniteui-angular/chat';
```

```html
 <igx-chat
        [options]="options()"
        [messages]="messages()"
        [draftMessage]="draftMessage"
        [templates]="templates()"
        (messageCreated)="onMessageCreated($event)">
    </igx-chat>

    <ng-template #messageHeader let-message>
        @if (message.sender !== 'user') {
            <div>
                <span style="font-weight: bold; color: #c00000;"
                >Developer Support</span
                >
            </div>
        }
    </ng-template>

    <ng-template #suggestionPrefix>
        <span style="font-weight: bold">💡</span>
    </ng-template>

    <ng-template #messageContent let-message igxChatMessageContext>
        <div [innerHTML]="message.text | fromMarkdown | async"></div>
    </ng-template>
```

```typescript
import { IgxChatComponent, IgxChatMessageContextDirective, type IgxChatOptions } from 'igniteui-angular/chat';
import { MarkdownPipe } from 'igniteui-angular/chat-extras';

@Component({
    selector: 'app-chat-features-sample',
    styleUrls: ['./features-sample.component.scss'],
    templateUrl: './features-sample.component.html',
    imports: [IgxChatComponent, IgxChatMessageContextDirective, AsyncPipe, MarkdownPipe]
})
export class ChatFeaturesSampleComponent {
    private _messageHeader = viewChild.required('messageHeader');
    private _suggestionPrefix = viewChild.required('suggestionPrefix');
    private _messageContent = viewChild.required('messageContent');

...


public options = signal<IgxChatOptions>({
        disableAutoScroll: false,
        disableInputAttachments: false,
        inputPlaceholder: 'Type your message here...',
        headerText: 'Developer Support',
        suggestionsPosition: "below-input",
        suggestions: [ 'Send me an e-mail when support is available.' ]
    });

    public templates = signal({});

    constructor() {
        effect(() => {
            const messageHeader = this._messageHeader();
            const suggestionPrefix = this._suggestionPrefix();
            const messageContent = this._messageContent();

            if (messageHeader && suggestionPrefix && messageContent) {
                this.templates.set({
                    messageHeader: messageHeader,
                    suggestionPrefix: suggestionPrefix,
                    messageContent: messageContent
                });
            }
        });
    }

    public onMessageCreated(e: any): void {
        const newMessage = e;
        this.messages.update(messages => [...messages, newMessage]);
        this.options.update(options => ({ ...options, isTyping: true, suggestions: [] }));

        const responseMessage = {
            id: Date.now().toString(),
            text: 'Our support team is currently unavailable. We\'ll get back to you as soon as possible.',
            sender: 'support',
            timestamp: Date.now().toString()
        };

        this.draftMessage = { text: '', attachments: [] };
        this.messages.update(messages => [...messages, responseMessage]);
        this.options.update(options => ({ ...options, isTyping: false }));
    }
```

## See Also

- [`setup.md`](./setup.md) — App providers, architecture, all entry points
- [`form-controls.md`](./form-controls.md) — Input Group, Combo, Select, Date/Time Pickers, Calendar, Checkbox, Radio, Switch, Slider
- [`layout.md`](./layout.md) — Tabs, Stepper, Accordion, Splitter, Navigation Drawer
- [`feedback.md`](./feedback.md) — Dialog, Snackbar, Toast, Banner
- [`directives.md`](./directives.md) — Button, Ripple, Tooltip, Drag and Drop
- [`../../igniteui-angular-grids/references/paging-remote.md`](../../igniteui-angular-grids/references/paging-remote.md) — Grid-specific paginator usage
