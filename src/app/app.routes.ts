import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovieListComponent } from './features//movie/movie-list/movie-list.component';
import { MovieDetailsComponent } from './features/movie/movie-details/movie-details.component';
import { LoginComponent } from './features/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: MovieListComponent, canActivate: [AuthGuard],  },
  { path: 'movie/:id', component: MovieDetailsComponent, canActivate: [AuthGuard],data: { showHeroBanner: false } },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }