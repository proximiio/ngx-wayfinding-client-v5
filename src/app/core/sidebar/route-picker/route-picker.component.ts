import { Component, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { StateService } from "../../state.service";
import { SidebarService } from "../sidebar.service";
import { FormBuilder, Validators } from "@angular/forms";
import { MapService } from "src/app/map/map.service";
import { map, startWith } from "rxjs/operators";
import { Feature } from "@turf/turf";

@Component({
  selector: "app-route-picker",
  templateUrl: "./route-picker.component.html",
  styleUrls: ["./route-picker.component.scss"],
})
export class RoutePickerComponent implements OnInit, OnDestroy {
  data;
  currentLanguage: string;
  options: any[] = [];
  filteredStartPois: Observable<any[]>;
  filteredDestinationPois: Observable<any[]>;
  routeForm = this.fb.group({
    startPoi: [this.stateService.state.startPoi, Validators.required],
    destinationPoi: [null, Validators.required],
  });
  startPoiId: string;
  startPoi: Feature;
  destinationPoiId: string;
  private subs: Subscription[] = [];

  constructor(
    public sidebarService: SidebarService,
    private stateService: StateService,
    private translateService: TranslateService,
    public mapService: MapService,
    private fb: FormBuilder
  ) {
    this.currentLanguage = this.translateService.currentLang;
    this.subs.push(
      this.sidebarService.getEndPointListener().subscribe((poi) => {
        if (poi && !this.stateService.state.kioskMode) {
          this.destinationPoiId = poi.id;
          this.routeForm.get("destinationPoi").setValue(poi);
        }
      }),
      this.mapService.getMapReadyListener().subscribe((ready) => {
        if (ready) {
          this.filteredStartPois = this.routeForm
            .get("startPoi")
            .valueChanges.pipe(
              startWith(""),
              map((value) =>
                typeof value === "string" ? value : value.properties.title
              ),
              map((title) =>
                title ? this._filter(title) : this.options.slice()
              )
            );
          this.options = this.sidebarService.sortedPOIs;
          this.setStartPoi();
        }
      })
    );
  }

  ngOnInit() {
    this.filteredDestinationPois = this.routeForm
      .get("destinationPoi")
      .valueChanges.pipe(
        startWith(""),
        map((value) =>
          typeof value === "string" ? value : value.properties.title
        ),
        map((title) => (title ? this._filter(title) : this.options.slice()))
      );
  }

  onClose() {
    this.sidebarService.showRoutePicker = false;
    this.startPoiId = null;
    this.setStartPoi();
  }

  onStartPoiSelect(e) {
    this.startPoiId = e.option.value.id;
    this.setStartPoi();
  }

  setStartPoi() {
    if (!this.stateService.state.kioskMode) {
      this.startPoi = this.sidebarService.sortedPOIs.find(
        (i) =>
          i.id ===
          (this.startPoiId
            ? this.startPoiId
            : this.stateService.state.startPoiId)
      );
      if (this.startPoi) {
        this.routeForm.get("startPoi").setValue(this.startPoi);
        // this.sidebarService.onSetStartPoi(startPoi);
      }
    }
  }

  onDestinationSelect(e) {
    const poi = e.option.value;
    this.destinationPoiId = poi.id;
    this.sidebarService.onSetEndPoi(poi);
  }

  displayPoi(poi: any): string {
    return poi && poi.properties && poi.properties.title
      ? `${poi.properties.title} - Floor: ${poi.properties.level}`
      : "";
  }

  onSubmit() {
    this.sidebarService.onSetStartPoi(this.startPoi);
    this.sidebarService.showRoutePicker = false;
  }

  private _filter(title: string): any[] {
    const filterValue = title.toLowerCase();

    return this.options.filter((option) =>
      option.properties.title.toLowerCase().includes(filterValue)
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
