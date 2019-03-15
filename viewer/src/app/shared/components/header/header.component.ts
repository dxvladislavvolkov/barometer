import { Component, NgModule, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services';
import { UserPanelModule } from '../user-panel/user-panel.component';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { Service } from '../../services/commits.service';

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {
  @Output()
  menuToggle = new EventEmitter<boolean>();

  @Input()
  menuToggleEnabled = false;

  @Input()
  title: string;

  repos: string[] = [
    'DevExpress/DevExtreme',
    'DevExpress/devextreme-angular',
    'DevExpress/devextreme-reactive',
    'DevExpress/testcafe',
    'angular/angular'
  ];

  userMenuItems = [{
    text: 'Profile',
    icon: 'user'
  }, {
    text: 'Logout',
    icon: 'runner',
    onClick: () => {
      this.authService.logOut();
    }
  }];

  constructor(private authService: AuthService, private service: Service) { }

  toggleMenu = () => {
    this.menuToggle.emit();
  }

  selectRepo = (e) => {
    this.service.changeRepo(e.value);
  }

  // updateRepos = () => {
  //   this.service.getRepos().subscribe((data) => {
  //     this.repos = data;
  //   });
  // }
}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    DxSelectBoxModule,
    UserPanelModule,
    DxToolbarModule
  ],
  declarations: [ HeaderComponent ],
  exports: [ HeaderComponent ]
})
export class HeaderModule { }
