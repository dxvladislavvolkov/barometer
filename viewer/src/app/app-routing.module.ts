import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFormComponent } from './shared/components';
import { AuthGuardService } from './shared/services';
import { HomeComponent } from './pages/home/home.component';
import { DisplayDataComponent } from './pages/display-data/display-data.component';
import { DisplayDataComponent as DisplayDataComponent2 } from './pages/display-data2/display-data.component';
import { DisplayDataComponent as DisplayDataComponent3 } from './pages/display-data3/display-data.component';
import { DxPivotGridModule } from 'devextreme-angular/ui/pivot-grid';
import { DxTreeListModule } from 'devextreme-angular/ui/tree-list';
import { DxChartModule } from 'devextreme-angular/ui/chart';
import { Service as CommitsService } from './shared/services/commits.service';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
  {
    path: 'home',
    component: DisplayDataComponent
  },
  {
    path: 'home2',
    component: DisplayDataComponent2
  },
  {
    path: 'home3',
    component: DisplayDataComponent3
  },
  {
    path: 'login-form',
    component: LoginFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: '**',
    redirectTo: 'home',
    canActivate: [ AuthGuardService ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), DxPivotGridModule, DxTreeListModule, HttpClientModule, DxChartModule],
  providers: [AuthGuardService, CommitsService],
  exports: [RouterModule],
  declarations: [HomeComponent, DisplayDataComponent, DisplayDataComponent2, DisplayDataComponent3]
})
export class AppRoutingModule { }
