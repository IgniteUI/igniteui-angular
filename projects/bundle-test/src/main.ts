import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';


bootstrapApplication(AppComponent, {...appConfig, providers: [...appConfig.providers]}).catch(err => console.error(err));
