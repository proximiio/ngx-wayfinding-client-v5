import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { StateService } from '../state.service';

@Component({
  templateUrl: './settings-dialog.component.html',
  selector: 'app-settings-dialog',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent {
  settingsForm = this.fb.group({
    latitude: [this.stateService.state.defaultLocation.coordinates[1], Validators.required],
    longitude: [this.stateService.state.defaultLocation.coordinates[0], Validators.required],
    level: [this.stateService.state.defaultLocation.level, Validators.required],
    zoom: [this.stateService.state.options.zoom, [Validators.required, Validators.min(0), Validators.max(24)]],
    bearing: [this.stateService.state.options.bearing, [Validators.required, Validators.min(-180), Validators.max(180)]],
    pitch: [this.stateService.state.options.pitch, [Validators.required, Validators.min(0), Validators.max(85)]]
  });

  constructor(
    public dialogRef: MatDialogRef<SettingsDialogComponent>,
    private fb: FormBuilder,
    private stateService: StateService
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }
}
