import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { AmenityToggleModel } from "../../amenity-toggle.model";
import { SidebarService } from "../sidebar.service";

@Component({
  selector: "app-amenity-picker",
  templateUrl: "./amenity-picker.component.html",
  styleUrls: ["./amenity-picker.component.scss"],
})
export class AmenityPickerComponent implements OnInit, OnDestroy {
  sidebarOpened = true;
  data: AmenityToggleModel[] = [
    {
      title: "toilet-men",
      iconImage: "assets/images/icons8-man.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:2a5b339e-30da-4186-9749-06906731b8c9",
      active: true,
    },
    {
      title: "toilet-woman",
      iconImage: "assets/images/icons8-woman.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:3574e57c-1ecf-47d5-b8f3-b9de1c39cf1b",
      active: true,
    },
    {
      title: "prayer-room",
      iconImage: "assets/images/icons8-mosque.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:8001844d-c059-4644-9275-6b3e66e8dd3c",
      active: true,
    },
    {
      title: "atm",
      iconImage: "assets/images/icons-atm.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:9c925821-744a-41c4-92cb-0342ab4c2ef9",
      active: true,
    },
    {
      title: "taxi",
      iconImage: "assets/images/icons-taxi.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:e835e573-36a6-47e2-9687-4ac05c6cd717",
      active: true,
    },
    {
      title: "metro",
      iconImage: "assets/images/icons-metro.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:e284a98b-f0b8-4bdc-9945-04219d3ef857",
      active: true,
    },
  ];
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
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
