import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { MovieListComponent } from './features/movie/movie-list/movie-list.component';
import { MovieDetailsComponent } from './features/movie/movie-details/movie-details.component';
import { LoginComponent } from './features/login/login.component';
import { HeaderComponent } from './features/header/header.component';

@NgModule({
  declarations: [

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppComponent,
    MovieListComponent,
    MovieDetailsComponent,
    LoginComponent,
    HeaderComponent
  ],
  providers: [],
})
export class AppModuleModule { }