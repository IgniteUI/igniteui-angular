
# IgxChat

**IgxChat** is a component that provides a chat interface, wrapping the **IgcChat** web component.

A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/chat)

# Usage

```html
<igx-chat
    [messages]="messages"
    [draftMessage]="draft"
    [options]="chatOptions"
    [templates]="chatTemplates"
    (messageCreated)="onMessageCreated($event)">
</igx-chat>
```

# API Summary
The following tables summarize the **igx-chat** inputs, outputs and directives.

### Inputs
The following inputs are available in the **igx-chat** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `messages` | `IgcChatMessage[]` | Array of chat messages to display |
| `draftMessage` | `{ text: string; attachments?: IgcChatMessageAttachment[] } \| undefined` | Draft message with text and optional attachments |
| `options` | `IgxChatOptions` | Configuration options for the chat component |
| `templates` | `IgxChatTemplates` | Custom templates for rendering chat elements |

### Outputs
The following outputs are available in the **igx-chat** component:

| Name | Description | Parameters |
| :--- | :--- | :--- |
| `messageCreated` | Emitted when a new message is created | `IgcChatMessage` |
| `messageReact` | Emitted when a user reacts to a message | `IgcChatMessageReaction` |
| `attachmentClick` | Emitted when an attachment is clicked | `IgcChatMessageAttachment` |
| `attachmentDrag` | Emitted when attachment drag starts | `void` |
| `attachmentDrop` | Emitted when attachment is dropped | `void` |
| `typingChange` | Emitted when typing indicator state changes | `boolean` |
| `inputFocus` | Emitted when the input receives focus | `void` |
| `inputBlur` | Emitted when the input loses focus | `void` |
| `inputChange` | Emitted when the input value changes | `string` |

### Directives
The following directives are available for type checking in templates:

| Name | Selector | Description |
| :--- | :--- | :--- |
| `IgxChatMessageContextDirective` | `[igxChatMessageContext]` | Provides type information for chat message template contexts |
| `IgxChatAttachmentContextDirective` | `[igxChatAttachmentContext]` | Provides type information for chat attachment template contexts |
| `IgxChatInputContextDirective` | `[igxChatInputContext]` | Provides type information for chat input template contexts |

# Chat Extras

The **chat-extras** module provides additional utilities for enhancing chat functionality.

## MarkdownPipe

The `MarkdownPipe` transforms markdown text into HTML, allowing you to render formatted messages in the chat.

### Usage

```typescript
import { MarkdownPipe } from 'igniteui-angular/chat-extras';

@Component({
    standalone: true,
    imports: [IgxChatComponent, MarkdownPipe, AsyncPipe],
    template: `
        <igx-chat [messages]="messages" [templates]="templates">
            <ng-template #renderer igxChatMessageContext let-message>
                <div [innerHTML]="message.text | fromMarkdown | async"></div>
            </ng-template>
        </igx-chat>
    `
})
```

### Supported Markdown Features

The pipe supports common markdown syntax including:
- **Bold** text (`**text**`)
- *Italic* text (`*text*`)
- Headings (`# H1`, `## H2`, etc.)
- Lists (ordered and unordered)
- Links (`[text](url)`)
- Code blocks and inline code
- Blockquotes
- And more...
