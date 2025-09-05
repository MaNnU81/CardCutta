import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CardComponent } from './components/card/card.component';
import { hasCardGuard } from './guards/card.guard';

export const routes: Routes = [

    {path: '', component: HomeComponent},
    {path: 'card', component: CardComponent,  canActivate: [hasCardGuard]},
    {path: '**', redirectTo: ''},

];
