import { Component, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { IgxForOfDirective, ButtonGroupAlignment } from 'igniteui-angular';
import { RemoteService } from '../shared/remote.service';


@Component({
    selector: 'app-virt-for-sample',
    templateUrl: 'virtual-for.sample.html',
    styleUrls: ['virtual-for.sample.css'],
    encapsulation: ViewEncapsulation.None
})
export class VirtualForSampleComponent implements OnInit {
    @ViewChild('virtDirVertical', { read: IgxForOfDirective, static: true })
    private virtDirVertical: IgxForOfDirective<any>;

    @ViewChild('virtDirHorizontal', { read: IgxForOfDirective, static: true })
    private virtDirHorizontal: IgxForOfDirective<any>;

    @ViewChild('virtDirRemote', { read: IgxForOfDirective, static: true })
    private virtDirRemote: IgxForOfDirective<any>;

    public alignment: ButtonGroupAlignment = ButtonGroupAlignment.vertical;
    public search1: string;
    public data = [];
    public remoteData: any;
    public totalCount: any;
    public options = {};
    public prevRequest: any;
    public itemSize = '50px';

    constructor(private remoteService: RemoteService) {
        this.remoteService.urlBuilder = (dataState) => {
            let qS = `?`;
            let requiredChunkSize;

            if (dataState) {
                const skip = dataState.startIndex;
                requiredChunkSize = dataState.chunkSize === 0 ? 10 : dataState.chunkSize;
                const top = requiredChunkSize;
                qS += `$skip=${skip}&$top=${top}&$count=true`;
            }
            return `${this.remoteService.url}${qS}`;
        };
     }

     public ngOnInit(): void {
        this.remoteData = this.remoteService.remoteData;
        this.totalCount = this.remoteService.totalCount;
        const data = [{
            key: 1,
            avatar: 'assets/images/avatar/1.jpg',
            favorite: true,
            link: '#',
            phone: '770-504-2217',
            text: 'Terrance Orta',
            height: 100
        }, {
            key: 2,
            avatar: 'assets/images/avatar/2.jpg',
            favorite: false,
            link: '#',
            phone: '423-676-2869',
            text: 'Richard Mahoney',
            height: 200
        }, {
            key: 3,
            avatar: 'assets/images/avatar/3.jpg',
            favorite: false,
            link: '#',
            phone: '859-496-2817',
            text: 'Donna Price',
            height: 300
        }, {
            key: 4,
            avatar: 'assets/images/avatar/4.jpg',
            favorite: false,
            link: '#',
            phone: '901-747-3428',
            text: 'Lisa Landers',
            height: 200
        }, {
            key: 5,
            avatar: 'assets/images/avatar/12.jpg',
            favorite: true,
            link: '#',
            phone: '573-394-9254',
            text: 'Dorothy H. Spencer',
            height: 200
        }, {
            key: 6,
            avatar: 'assets/images/avatar/13.jpg',
            favorite: false,
            link: '#',
            phone: '323-668-1482',
            text: 'Stephanie May',
            height: 100
        }, {
            key: 7,
            avatar: 'assets/images/avatar/14.jpg',
            favorite: false,
            link: '#',
            phone: '401-661-3742',
            text: 'Marianne Taylor',
            height: 100
        }, {
            key: 8,
            avatar: 'assets/images/avatar/15.jpg',
            favorite: true,
            link: '#',
            phone: '662-374-2920',
            text: 'Tammie Alvarez',
            height: 300
        }, {
            key: 9,
            avatar: 'assets/images/avatar/16.jpg',
            favorite: true,
            link: '#',
            phone: '240-455-2267',
            text: 'Charlotte Flores',
            height: 200
        }, {
            key: 10,
            avatar: 'assets/images/avatar/17.jpg',
            favorite: false,
            link: '#',
            phone: '724-742-0979',
            text: 'Ward Riley',
            height: 100
        }];
        for (let i = 10; i < 100; i++) {
            const obj = Object.assign({}, data[i % 10]);
            obj['key'] = i;
            data.push(obj);
        }
        this.data = data;
    }
    public chunkLoading(evt) {
        if (this.prevRequest) {
            this.prevRequest.unsubscribe();
        }
        this.prevRequest = this.remoteService.getData(evt, () => {
            this.virtDirRemote.cdr.detectChanges();
        });
    }
    public scrNextRow() {
        this.virtDirVertical.scrollNext();
    }
    public scrPrevRow() {
        this.virtDirVertical.scrollPrev();
    }
    public scrNextPage() {
        this.virtDirVertical.scrollNextPage();
    }
    public scrPrevPage() {
        this.virtDirVertical.scrollPrevPage();
    }
    public scrScrollTo(index) {
        this.virtDirVertical.scrollTo(parseInt(index, 10));
    }
    public scrNextCol() {
        this.virtDirHorizontal.scrollNext();
    }
    public scrPrevCol() {
        this.virtDirHorizontal.scrollPrev();
    }
    public  scrNextHorizontalPage() {
        this.virtDirHorizontal.scrollNextPage();
    }
    public scrPrevHorizontalPage() {
        this.virtDirHorizontal.scrollPrevPage();
    }

    public horizontalVisibleItemCount() {
        const count = this.virtDirHorizontal.getItemCountInView();
        console.log(count);
    }
    public verticalVisibleItemCount() {
        const count = this.virtDirVertical.getItemCountInView();
        console.log(count);
    }

    public scrHorizontalScrollTo(index) {
        this.virtDirHorizontal.scrollTo(parseInt(index, 10));
    }

    public trackByKey(index, item) {
        return item.key;
    }

    public changeItemSize() {
        if (this.itemSize === '50px') {
            this.itemSize = '100px';
        } else {
            this.itemSize = '50px';
        }

    }

}
