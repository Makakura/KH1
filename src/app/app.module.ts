import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { InputInfoComponent } from './input-info/input-info.component';
import { RouterModule, Routes} from '@angular/router';
import { EventManagementComponent } from './event-management/event-management.component'
import { HttpModule } from '@angular/http';
import { ResultManagementComponent } from './result-management/result-management.component';
import { CodeManagementComponent } from './code-management/code-management.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    InputInfoComponent,
    EventManagementComponent,
    ResultManagementComponent,
    CodeManagementComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    RouterModule.forRoot([
      {path: '', component: EventManagementComponent},
      {path: 'wheel/:id', component: HomeComponent },
      {path: 'result/:id', component: ResultManagementComponent },
      {path: 'code/:id', component: CodeManagementComponent }
    ], {useHash: true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
