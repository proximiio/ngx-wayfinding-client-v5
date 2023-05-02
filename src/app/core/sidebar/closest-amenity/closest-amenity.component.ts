import { Component, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { StateService } from "../../state.service";
import { SidebarService } from "../sidebar.service";
import { FormBuilder, Validators } from "@angular/forms";
import { MapService } from "src/app/map/map.service";
import { map, startWith } from "rxjs/operators";
import { amenityData } from "../amenity-picker/amenity-picker.component";
import { AmenityToggleModel } from "../../amenity-toggle.model";
import * as removeAccents from "remove-accents";

@Component({
  selector: "app-closest-amenity",
  templateUrl: "./closest-amenity.component.html",
  styleUrls: ["./closest-amenity.component.scss"],
})
export class ClosestAmenityComponent implements OnInit, OnDestroy {
  data;
  currentLanguage: string;
  options: any[] = [];
  amenityOptions = amenityData;
  filteredPois: Observable<any[]>;
  filteredAmenities: Observable<AmenityToggleModel[]>;
  routeForm = this.fb.group({
    startPoi: [this.stateService.state.startPoi, Validators.required],
    destinationPoi: [null, Validators.required],
  });
  startPoiId: string;
  destinationAmenityId: string;
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
      this.sidebarService.getAmenityToggleListener().subscribe((res) => {
        if (
          res &&
          res.category === "amenities" &&
          !this.stateService.state.kioskMode
        ) {
          this.destinationAmenityId = res.amenityId;
          this.sidebarService.showClosestAmenityPicker = true;
          this.routeForm
            .get("destinationPoi")
            .setValue(this.amenityOptions.find((i) => i.id === res.amenityId));
        }
      }),
      this.mapService.getMapReadyListener().subscribe((ready) => {
        if (ready) {
          this.filteredPois = this.routeForm.get("startPoi").valueChanges.pipe(
            startWith(""),
            map((value) =>
              typeof value === "string" ? value : value.properties.title
            ),
            map((title) =>
              title ? this._filter(title, "pois") : this.options.slice()
            )
          );
          this.options = this.sidebarService.sortedPOIs;
          this.setStartPoi();
        }
      })
    );
  }

  ngOnInit() {
    this.filteredAmenities = this.routeForm
      .get("destinationPoi")
      .valueChanges.pipe(
        startWith(""),
        map((value) => (typeof value === "string" ? value : value.title)),
        map((title) =>
          title ? this._filter(title, "amenities") : this.amenityOptions.slice()
        )
      );
  }

  onClose() {
    this.sidebarService.onAmenityToggle(
      "amenities",
      this.sidebarService.filteredAmenity
    );
    this.sidebarService.showClosestAmenityPicker = false;
    this.sidebarService.activeListItem = null;
    this.startPoiId = null;
    this.setStartPoi();
    this.sidebarService.onSetEndPoi(null);
  }

  onStartPoiSelect(e) {
    this.startPoiId = e.option.value.id;
    this.setStartPoi();
  }

  setStartPoi() {
    if (!this.stateService.state.kioskMode) {
      const startPoi = this.sidebarService.sortedPOIs.find(
        (i) =>
          i.id ===
          (this.startPoiId
            ? this.startPoiId
            : this.stateService.state.startPoiId)
      );
      if (startPoi) {
        this.routeForm.get("startPoi").setValue(startPoi);
        this.sidebarService.onSetStartPoi(startPoi);
      }
    }
  }

  onDestinationSelect(e) {
    this.destinationAmenityId = e.option.value.id;
    if (this.sidebarService.filteredAmenity !== this.destinationAmenityId) {
      this.sidebarService.onAmenityToggle(
        "amenities",
        this.destinationAmenityId
      );
      this.sidebarService.activeListItem = e.option.value;
    }
  }

  displayPoi(poi: any): string {
    return poi && poi.properties && poi.properties.title
      ? `${poi.properties.title} - Floor: ${poi.properties.level}`
      : "";
  }

  displayAmenity = (amenity: AmenityToggleModel): string => {
    return amenity && amenity.title
      ? `Closest ${this.translateService.instant(amenity.title)}`
      : "";
  };

  onSubmit() {
    this.sidebarService.onRouteToClosestAmenity();
  }

  private _filter(title: string, type: string): any[] {
    const filterValue = title.toLowerCase();

    if (type === "pois") {
      return this.options.filter((option) =>
        removeAccents(option.properties.title)
          .toLowerCase()
          .includes(removeAccents(filterValue))
      );
    }

    if (type === "amenities") {
      return this.amenityOptions.filter((option) => {
        const title = `Closest ${this.translateService.instant(option.title)}`;
        return title.toLowerCase().includes(filterValue);
      });
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
