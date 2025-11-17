
import { AsyncPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    effect,
    signal,
    viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IgxChatComponent,
    IgxChatMessageContextDirective,
    type IgxChatOptions,
} from 'igniteui-angular';
import { MarkdownPipe } from 'igniteui-angular/chat-extras';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-chat-sample',
    styleUrls: ['chat.sample.scss'],
    templateUrl: 'chat.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        FormsModule,
        AsyncPipe,
        IgxChatComponent,
        MarkdownPipe,
        IgxChatMessageContextDirective,
    ]
})
export class ChatSampleComponent {
    protected _template = viewChild.required('renderer');

    public messages = signal([
        {
            id: '1',
            text: `Hello. How can we assist you today?`,
            sender: 'support',
        },
        {
            id: '2',
            text: `Hello. I have problem with styling IgcAvatarComponent. Can you take a look at the attached file and help me?`,
            sender: 'user',
            attachments: [
                {
                    id: 'AvatarStyles.css',
                    name: 'AvatarStyles.css',
                    url: './styles/AvatarStyles.css',
                    type: 'text/css'
                },
            ],
        },
        {
            id: '3',
            text: `Sure, give me a moment to check the file.`,
            sender: 'support',
        },
        {
            id: '4',
            text: `
Thank you for your patience. It seems that the issue is the name of the **CSS part**. Here is the fixed code:


\`\`\`css
igc-avatar::part(base) {
    --size: 60px;
    color: var(--ig-success-500-contrast);
    background: var(--ig-success-500);
    border-radius: 20px;
}
\`\`\``,
            sender: 'support',
        },
        {
            id: '123213123',
            sender: 'support',
            text: `
Here is some typescript:


\`\`\`ts

class User {
    constructor(public name: string, public age: number) {}
}
\`\`\``
        }
    ]);

    public options = signal<IgxChatOptions>({
        disableAutoScroll: false,
        disableInputAttachments: false,
        suggestions: [`It works. Thanks.`, `It doesn't work.`],
        inputPlaceholder: 'Type your message here...',
        headerText: 'Customer Support',
    });


    public templates = signal({});

    constructor() {
        effect(() => {
            const template = this._template();
            if (template) {
                this.templates.set({ messageContent: template });
            }
        });
    }

    public onMessageReact(event: any) {
        console.log(event);
    }
}
