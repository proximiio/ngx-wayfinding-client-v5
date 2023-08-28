import { Component, OnInit } from "@angular/core";
import { StateService } from "../../state.service";
import { SidebarService } from "../sidebar.service";
import { FloorModel } from "proximiio-js-library/lib/models/floor";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-floor-picker",
  templateUrl: "./floor-picker.component.html",
  styleUrls: ["./floor-picker.component.scss"],
})
export class FloorPickerComponent implements OnInit {
  constructor(
    private sidebarService: SidebarService,
    public stateService: StateService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {}

  onFloorPick(floor: FloorModel) {
    this.sidebarService.floorChangeListener.next(floor as FloorModel);
  }

  getFloorName(floor: FloorModel) {
    return this.sidebarService.getFloorName(floor, this.translateService.currentLang);
  }
}
