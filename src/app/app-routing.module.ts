import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MockupComponent} from './mockup/mockup.component';
import {MainComponent} from './main/main.component';

const routes: Routes = [
  {path: '', redirectTo: '/', pathMatch: 'full'},
  {path: 'main', component: MainComponent},
  {path: 'mockup', component: MockupComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
