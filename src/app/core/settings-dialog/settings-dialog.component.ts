import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, Validators } from "@angular/forms";
import { StateService } from "../state.service";
import Keyboard from "simple-keyboard";

@Component({
  templateUrl: "./settings-dialog.component.html",
  selector: "app-settings-dialog",
  styleUrls: ["./settings-dialog.component.scss"],
})
export class SettingsDialogComponent {
  settingsForm = this.fb.group({
    latitude: [
      this.stateService.state.defaultLocation.coordinates[1],
      Validators.required,
    ],
    longitude: [
      this.stateService.state.defaultLocation.coordinates[0],
      Validators.required,
    ],
    level: [this.stateService.state.defaultLocation.level, Validators.required],
    zoom: [
      this.stateService.state.options.zoom,
      [Validators.required, Validators.min(0), Validators.max(24)],
    ],
    bearing: [
      this.stateService.state.options.bearing,
      [Validators.required, Validators.min(-180), Validators.max(180)],
    ],
    pitch: [
      this.stateService.state.options.pitch,
      [Validators.required, Validators.min(0), Validators.max(85)],
    ],
  });
  keyboard: Keyboard;
  activeField;

  constructor(
    public dialogRef: MatDialogRef<SettingsDialogComponent>,
    private fb: FormBuilder,
    private stateService: StateService
  ) {
    if (this.stateService.state.kioskMode && !this.keyboard?.initialized) {
      this.keyboard = new Keyboard({
        layout: {
          default: [
            '- 1 2 3 4 5 6 7 8 9 0 {bksp}',
          ]
        },
        theme: "hg-theme-default hg-layout-numeric numeric-theme",
        preventMouseDownDefault: true,
        onChange: (input) => this.onChange(input)
      });
    }
    dialogRef.beforeClosed().subscribe(() => {
      if (this.stateService.state.kioskMode) {
        this.keyboard.destroy();
      }
    });
  }

  onChange = (input: string) => {
    this.settingsForm.controls[this.activeField].setValue(input);
  };

  onFieldSelect(field) {
    this.activeField = field;
    if (this.stateService.state.kioskMode && this.keyboard?.initialized) {
      this.keyboard.setInput(this.settingsForm.value[this.activeField]);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
