import { Component, ViewChild } from '@angular/core';
import { RouterLink, RouterOutlet, Routes } from '@angular/router';
import { IgxButtonDirective } from 'igniteui-angular';
import { routes } from './app.routes';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, IgxButtonDirective, RouterLink],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    protected routes: Routes = routes;

    @ViewChild(RouterOutlet) outlet!: RouterOutlet;

    public async OnPerfTest() {
        const longTask = [];
        const observer = new PerformanceObserver((list) => {
            longTask.push(...list.getEntries());
          });
          observer.observe({ entryTypes: ['longtask'] });
          const grid = (this.outlet.component as any).grid || (this.outlet.component as any).pivotGrid;
          for (let i = 0; i < 100; i++) {
            grid.navigateTo(i * 50);
            await new Promise(r => setTimeout(r, 50));
          }
          const sum = longTask.reduce((acc, task) => acc + task.duration, 0);
          const avgTime = sum / longTask.length;
          console.log('Long Tasks:'+ longTask.length + ", ", 'Average Long Task Time:', avgTime);
          observer.disconnect();

    }
}
