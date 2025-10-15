
import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    OnInit,
    signal,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IgxChatComponent,
    IgxChatMessageContextDirective,
} from 'igniteui-angular';
import { createMarkdownRenderer } from 'igniteui-webcomponents/extras';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-chat-sample',
    styleUrls: ['chat.sample.scss'],
    templateUrl: 'chat.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        FormsModule,
        IgxChatComponent,
        IgxChatMessageContextDirective,
    ]
})
export class ChatSampleComponent implements OnInit {
    public messages: any[] = [];
    public options = {
        disableAutoScroll: false,
        disableInputAttachments: false,
        suggestions: [`It's there. Thanks.`, `It's not there.`],
        inputPlaceholder: 'Type your message here...',
        headerText: 'Customer Support',
    };
    public markdownRenderer = signal<any>(null);

    constructor() {
    }

    public ngOnInit() {
        this.messages = [
            {
                id: '1',
                text: `Hello. How can we assist you today?`,
                sender: 'support',
                timestamp: (Date.now() - 3500000).toString()
            },
            {
                id: '2',
                text: `Hello. I have problem with styling IgcAvatarComponent. Can you take a look at the attached file and help me?`,
                sender: 'user',
                timestamp: (Date.now() - 3400000).toString(),
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
                timestamp: (Date.now() - 3300000).toString()
            },
            {
                id: '4',
                text: `Thank you for your patience. It seems that the issue is the name of the CSS part. Here is the fixed code:
        \`\`\`css
        igc-avatar::part(base) {
        --size: 60px;
        color: var(--ig-success-500-contrast);
        background: var(--ig-success-500);
        border-radius: 20px;
        }
        \`\`\`
            `,
                sender: 'support',
                timestamp: (Date.now() - 3200000).toString()
            },
        ];

       createMarkdownRenderer().then((renderer) => {
            this.markdownRenderer.set(renderer);
        });
    }
}
