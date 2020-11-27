import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  templateUrl: './notification-dialog.component.html',
  selector: 'app-notification-dialog',
  styleUrls: ['./notification-dialog.component.scss']
})
export class NotificationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string, code: string, header: string, token: string, closeText: string }) {}
}
