import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { InputInfoComponent } from './input-info/input-info.component';
import { RouterModule, Routes} from '@angular/router'


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    InputInfoComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {path: '', component: HomeComponent},
      {path: 'form', component: InputInfoComponent},
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
