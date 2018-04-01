import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { InputInfoComponent } from './input-info/input-info.component';
import { RouterModule, Routes} from '@angular/router';
import { EventManagementComponent } from './event-management/event-management.component'
import { HttpModule } from '@angular/http';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    InputInfoComponent,
    EventManagementComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    RouterModule.forRoot([
      {path: '', component: EventManagementComponent},
      {path: 'wheel/:id', component: HomeComponent }
    ], {useHash: true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
