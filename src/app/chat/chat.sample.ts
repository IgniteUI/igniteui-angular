
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
} from 'igniteui-angular/chat';
import { IgxAvatarComponent } from 'igniteui-angular/avatar';
import { MarkdownPipe } from 'igniteui-angular/chat-extras';

const SUPPORT_AVATAR = 'https://i.pravatar.cc/150?img=47';
const USER_AVATAR = 'https://i.pravatar.cc/150?img=12';

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
        IgxAvatarComponent,
        MarkdownPipe,
        IgxChatMessageContextDirective,
    ]
})
export class ChatSampleComponent {
    protected _template = viewChild.required('renderer');
    protected _headerTemplate = viewChild.required('headerRenderer');

    public draftMessage = { text: '', attachments: [] };

    public messages = signal([
        {
            id: '1',
            text: `Hello! How can we assist you today?`,
            sender: 'support',
            timestamp: (Date.now() - 3500000).toString()
        },
        {
            id: '2',
            text: `Hi, I have a question about my recent order, #7890. The tracking shows 'delivered' but I haven't received it.`,
            sender: 'user',
            timestamp: (Date.now() - 3400000).toString()
        },
        {
            id: '3',
            text: `I've reviewed the delivery details. It seems the package was left near your side door. Here's a photo from our delivery driver showing where it was placed.`,
            sender: 'support',
            timestamp: (Date.now() - 3300000).toString(),
            attachments: [
                {
                    id: 'delivery-location-image',
                    name: 'Delivery location',
                    url: 'https://media.istockphoto.com/id/1207972183/photo/merchandise-delivery-from-online-ordering.jpg?s=612x612&w=0&k=20&c=cGcMqd_8FALv4Tueh7sllYZuDXurkfkqoJf6IAIWhJk=',
                    type: 'image'
                }
            ]
        },
        {
            id: '4',
            text: `Also, here is the styling fix you asked about earlier. The issue was the **CSS part** name:

\`\`\`css
igc-avatar::part(base) {
    --size: 60px;
    color: var(--ig-success-500-contrast);
    background: var(--ig-success-500);
    border-radius: 20px;
}
\`\`\``,
            sender: 'support',
            timestamp: (Date.now() - 3200000).toString()
        }
    ]);

    public options = signal<IgxChatOptions>({
        disableAutoScroll: false,
        disableInputAttachments: false,
        suggestions: [`It's there. Thanks!`, `It's not there.`],
        inputPlaceholder: 'Type your message here...',
        headerText: 'Customer Support',
        adoptRootStyles: true
    });

    public templates = signal({});

    public readonly senderAvatars: Record<string, string> = {
        support: SUPPORT_AVATAR,
        user: USER_AVATAR
    };

    constructor() {
        effect(() => {
            const messageTemplate = this._template();
            const headerTemplate = this._headerTemplate();
            if (messageTemplate && headerTemplate) {
                this.templates.set({
                    messageContent: messageTemplate,
                    messageHeader: headerTemplate
                });
            }
        });
    }

    public onMessageCreated(msg: any): void {
        this.messages.update(messages => ([...messages, msg]));
        this.options.update(options => ({ ...options, isTyping: true, suggestions: [] }));

        const messageText = (msg.text as string).toLowerCase();
        const responseText = messageText.includes('not there')
            ? `We're sorry to hear that! We'll escalate this to our delivery team and get back to you within 24 hours.`
            : messageText.includes('there')
                ? `Glad to hear that! If you have any more questions, feel free to ask. We're here to help!`
                : `Our support team will review your message and respond as soon as possible. Thank you for your patience!`;

        setTimeout(() => {
            this.messages.update(messages => ([...messages, {
                id: Date.now().toString(),
                text: responseText,
                sender: 'support',
                timestamp: Date.now().toString()
            }]));
            this.options.update(options => ({ ...options, isTyping: false }));
            this.draftMessage = { text: '', attachments: [] };
        }, 1500);
    }

    public onMessageReact(event: any) {
        console.log(event);
    }
}
