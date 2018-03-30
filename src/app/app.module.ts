import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { InputInfoComponent } from './input-info/input-info.component';
import { RouterModule, Routes} from '@angular/router';
import { EventManagementComponent } from './event-management/event-management.component'


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    InputInfoComponent,
    EventManagementComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {path: '', component: EventManagementComponent},
      {path: 'wheel', component: HomeComponent }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
