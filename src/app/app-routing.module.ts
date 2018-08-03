import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MockupComponent} from './mockup/mockup.component';
import {MainComponent} from './main/main.component';
import {Test03Component} from './test-03/test-03.component';

const appRoutes: Routes = [
  {path: 'main', component: MainComponent},
  {path: 'mockup', component: MockupComponent},
  {path: 'test-03', component: Test03Component},
  {path: '', redirectTo: '/mockup', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, {enableTracing: false})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
