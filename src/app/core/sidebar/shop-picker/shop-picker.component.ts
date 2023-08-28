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
  data: AmenityToggleModel[] = [{
    title: 'Cafés',
    icon: ['fal', 'coffee'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:c693d414-4613-4c6c-95da-771e52759873',
    active: true
  }, {
    title: 'Clothing',
    icon: ['fal', 'tshirt'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:d111c5e4-1a63-48b3-94de-5fa7b309daaf',
    active: true
  }, {
    title: 'Groceries',
    icon: ['fal', 'shopping-cart'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:da5435e2-9179-4ca6-86e4-652b7e8d109b',
    active: true
  }, {
    title: 'Restaurants',
    icon: ['fal', 'utensils'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:c96e80d7-6683-4ca0-bc64-b6ed3fc824e2',
    active: true
  }, {
    title: 'Shoes',
    icon: ['fal', 'boot'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:f62dd757-4057-4015-97a0-c66d8934f7d8',
    active: true
  }];
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
