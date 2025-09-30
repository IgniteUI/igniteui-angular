import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IgxChatComponent } from './chat.component'
import { Component, signal, TemplateRef, viewChild } from '@angular/core';
import type { IgcChatMessage } from 'igniteui-webcomponents';

describe('Chat wrapper', () => {
    function getShadowRoot(element: HTMLElement) {
        return element.shadowRoot;
    }

    let chatComponent: IgxChatComponent;
    let chatElement: HTMLElement;
    let fixture: ComponentFixture<IgxChatComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [IgxChatComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IgxChatComponent);
        chatComponent = fixture.componentInstance;
        chatElement = (fixture.nativeElement as HTMLElement).querySelector('igc-chat');
        fixture.detectChanges();
    })

    it('is created', () => {
        expect(chatComponent).toBeDefined();
    });

    it('has correct initial empty state', () => {
        const draft = chatComponent.draftMessage();

        expect(chatComponent.messages().length).toEqual(0);
        expect(draft.text).toEqual('');
        expect(draft.attachments).toBeUndefined();
    });

    it('correct bindings for messages', async () => {
        fixture.componentRef.setInput('messages', [{ id: '1', sender: 'user', text: 'Hello' }]);

        fixture.detectChanges();
        await fixture.whenStable();

        const messageElement = getShadowRoot(chatElement).querySelector<HTMLElement>('igc-chat-message');
        expect(messageElement).toBeDefined();
        expect(getShadowRoot(messageElement).textContent.trim()).toEqual(chatComponent.messages()[0].text);
    });

    it('correct bindings for draft message', async () => {
        fixture.componentRef.setInput('draftMessage', { text: 'Hello world' });

        fixture.detectChanges();
        await fixture.whenStable();

        const textarea = getShadowRoot(getShadowRoot(chatElement).querySelector('igc-chat-input')).querySelector('igc-textarea');
        expect(textarea.value).toEqual(chatComponent.draftMessage().text);
    });
});

describe('Chat templates', () => {
    function getShadowRoot(element: HTMLElement) {
        return element.shadowRoot;
    }

    let fixture: ComponentFixture<ChatTemplatesBed>;
    let chatElement: HTMLElement;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [IgxChatComponent, ChatTemplatesBed]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatTemplatesBed);
        fixture.detectChanges();
        chatElement = (fixture.nativeElement as HTMLElement).querySelector('igc-chat');
    });

    it('has correct initially bound template', async () => {
        await fixture.whenStable();

        // NOTE: This is invoked since in the test bed there is no app ref so fresh embedded view
        // has no change detection ran on it. In an application scenario this is not the case.
        // This is so we don't explicitly invoke `viewRef.detectChanges()` inside the returned closure
        // from the wrapper's `_createTemplateRenderer` call.
        fixture.detectChanges();
        expect(getShadowRoot(getShadowRoot(chatElement).querySelector('igc-chat-message')).textContent.trim())
            .toEqual(`Your message: ${fixture.componentInstance.messages()[0].text}`);
    });
});


@Component({
    template: `
        <igx-chat [messages]="messages()" [templates]="{messageContent: messageTemplate()}"/>
        <ng-template #message let-message>
            <h3>Your message: {{ message.text }}</h3>
        </ng-template>
    `,
    imports: [IgxChatComponent]
})
class ChatTemplatesBed {
    public messages = signal<IgcChatMessage[]>([{
        id: '1',
        sender: 'user',
        text: 'Hello world'
    }]);
    public messageTemplate = viewChild.required<TemplateRef<any>>('message');
}
