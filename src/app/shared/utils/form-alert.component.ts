import {Component, Input} from '@angular/core';

import {AlertMessage, Errors} from '../models';

@Component({
  selector: 'app-form-alert',
  templateUrl: './form-alert.component.html',
  styleUrls: ['./form-alert.component.css']
})
export class FormAlertComponent {
  alertMessage: AlertMessage = new AlertMessage();
  messageRole: string = 'role';
  allowedTypes = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

  @Input()
  set message(alertMessage: AlertMessage) {
    //console.log("form-alert.component - set alertMessage:", alertMessage);
    this.alertMessage.alertType = (alertMessage.alertType && this.allowedTypes.indexOf(alertMessage.alertType) > -1)? 'alert-'+ alertMessage.alertType : 'alert-primary';
    this.alertMessage.message = alertMessage.message;
  }

  get message() {
    console.log("form-alert.component - get alertMessage:", this.alertMessage);
    return this.alertMessage;
  }

}
