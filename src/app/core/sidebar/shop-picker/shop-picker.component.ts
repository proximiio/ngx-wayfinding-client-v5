import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { AmenityToggleModel } from "../../amenity-toggle.model";
import { SidebarService } from "../sidebar.service";

@Component({
  selector: "app-shop-picker",
  templateUrl: "./shop-picker.component.html",
  styleUrls: ["./shop-picker.component.scss"],
})
export class ShopPickerComponent implements OnInit, OnDestroy {
  sidebarOpened = true;
  data: AmenityToggleModel[] = [
    {
      title: "line-store",
      iconImage: "assets/images/icons8-shopping-bag.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:ab9f7580-06fa-4f0f-bb63-7e8206238acc",
      active: true,
    },
    {
      title: "anchor-store",
      iconImage: "assets/images/icons8-star.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:2d4df5f8-0cc5-442d-a346-411f5ae75bc6",
      active: true,
    },
    {
      title: "cafe",
      iconImage: "assets/images/icons8-coffee-beans.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:50f207f0-8346-4125-9470-358023fbe5c5",
      active: true,
    },
    {
      title: "fast-food",
      iconImage: "assets/images/icons8-hamburger.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:5c1229eb-4125-4bf5-a005-8c6851d51787",
      active: true,
    },
    {
      title: "restaurant",
      iconImage: "assets/images/icons8-tableware.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:53c8a23f-04c7-4ece-8f52-10c30a6f0167",
      active: true,
    },
    {
      title: "entertainment",
      iconImage: "assets/images/icons8-smiling.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:1b20689d-8db3-41bf-b42e-6a4c69a06c71",
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
                item.active && !this.sidebarService.filteredShop
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
    this.sidebarService.onAmenityToggle("shop", item.id);
    this.sidebarService.activeListItem = item;
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
