import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { AmenityToggleModel } from "../../amenity-toggle.model";
import { SidebarService } from "../sidebar.service";

export const amenityData: AmenityToggleModel[] = [
  {
    title: "cafes", // category title
    icon: ["fal", "coffee"], // category fontAwesome icon, please add in fontawesome.module.ts in case it's missing
    id: "another-amenity-id", // amenity id, must be the same as defined in setAmenityCategory method
    active: true, // set category as active
  },
];

@Component({
  selector: "app-amenity-picker",
  templateUrl: "./amenity-picker.component.html",
  styleUrls: ["./amenity-picker.component.scss"],
})
export class AmenityPickerComponent implements OnInit, OnDestroy {
  sidebarOpened = true;
  data = amenityData;
  private subs: Subscription[] = [];

  constructor(private sidebarService: SidebarService) {
    this.subs.push(
      this.sidebarService.getAmenityToggleListener().subscribe((res) => {
        if (res) {
          // handle active toggling
          const item = this.data.find((i) => i.id === res.amenityId);
          if (item) {
            this.data = this.data.map((i) => {
              i.active =
                item.active && !this.sidebarService.filteredAmenity
                  ? true
                  : item.id === i.id;
              return i;
            });
          }
        }
      })
    );
  }

  ngOnInit() {}

  onFilterClick(item: AmenityToggleModel) {
    // will do some job at sidebarService, two arguments are expected, category title (same as was defined in setAmenityCategory method) and amenity id
    this.sidebarService.onAmenityToggle("amenities", item.id);
    this.sidebarService.activeListItem = item;
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
