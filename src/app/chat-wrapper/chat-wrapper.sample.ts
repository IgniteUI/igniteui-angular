import { NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    IgxButtonDirective,
    IgxChatWrapperComponent,
} from 'igniteui-angular';
import {
    defineComponents,
    IgcChatComponent
} from 'igniteui-webcomponents';


defineComponents(
    IgcChatComponent
);

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-chat-wrapper-sample',
    styleUrls: ['chat-wrapper.sample.scss'],
    templateUrl: 'chat-wrapper.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        IgxButtonDirective,
        IgxChatWrapperComponent,
        NgTemplateOutlet
    ]
})
export class ChatWrapperSampleComponent implements AfterViewInit {
    private msgTemplate?: TemplateRef<any>;

    @ViewChild('chatWrapper', { read: IgxChatWrapperComponent })
    public chatWrapper!: IgxChatWrapperComponent;

    @ViewChild('messageTemplate1', { static: true })
    public messageTemplate1!: TemplateRef<any>;

    @ViewChild('messageTemplate2', { static: true })
    public messageTemplate2!: TemplateRef<any>;
    
    @ViewChild('attachmentsTemplate', { static: true })
    public attachmentsTemplate!: TemplateRef<any>;

    public messages = [
        {
            id: '1',
            text: 'Hello! How can I help you today?',
            sender: 'bot',
            timestamp: new Date(Date.now() - 3600000),
        }
    ];

    public options = {
        templates: {}
    };
    
    ngAfterViewInit() {
        this.options.templates = {
            messageTemplate: this.messageTemplate1,
            textAreaAttachmentsTemplate: this.attachmentsTemplate
        };
        this.chatWrapper.options.set({ ...this.options, templates: this.options.templates });
    }

    public onClick(context: any) {
        console.log('Context: ' + context);
    }

    public switchMessageTemplate() {
        this.msgTemplate = this.msgTemplate === this.messageTemplate2 ? this.messageTemplate1 : this.messageTemplate2;
        this.options.templates = {
            ...this.options.templates,
            messageTemplate: this.msgTemplate,
            textAreaAttachmentsTemplate: this.attachmentsTemplate
        };
        this.chatWrapper.options.set({ ...this.options, templates: this.options.templates });
        this.messages = [...this.chatWrapper.messages()];
    } 
    
    public onMessageCreated($event: any) {
        const newMessage = $event.detail;
        this.messages = [...this.messages, newMessage];
    }
}