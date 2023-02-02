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
      title: "fashion",
      iconImage: "assets/images/icons8-dress-front-view.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:935570c1-cd4e-4c70-8e9d-87e63a0e061b",
      active: true,
    },
    {
      title: "grocery",
      iconImage: "assets/images/icons8-ingredients.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:2ee8fe09-6b1f-4ff7-999b-fd6c53802b04",
      active: true,
    },
    {
      title: "health",
      iconImage: "assets/images/icons8-caduceus.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:04dd218a-adf1-4947-866d-b679badb895a",
      active: true,
    },
    {
      title: "eyewear",
      iconImage: "assets/images/icons8-glasses.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:576270da-2592-439f-9082-74f198c8bf6c",
      active: true,
    },
    {
      title: "fitness",
      iconImage: "assets/images/icons8-weightlifting.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:15120502-00af-47e6-b9ec-53fc35d042c8",
      active: true,
    },
    {
      title: "travel",
      iconImage: "assets/images/icons8-carry-on-luggage.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:76f90c15-b759-43b4-aa96-457568adbfd4",
      active: true,
    },
    {
      title: "books",
      iconImage: "assets/images/icon-books.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:fe68247a-5c8c-427f-b276-b94b1c39e5da",
      active: true,
    },
    {
      title: "luxury",
      iconImage: "assets/images/icons8-jewel.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:ed0c8e0b-f28b-462b-bd24-3e1f9d1720f1",
      active: true,
    },
    {
      title: "electronics",
      iconImage: "assets/images/icon-electronics.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:4987b765-0c5e-4bcb-979b-fdbe2adb7979",
      active: true,
    },
    {
      title: "home",
      iconImage: "assets/images/icons8-lounge.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:9f3ec695-2fe2-44a6-8390-547d50487f0c",
      active: true,
    },
    {
      title: "beauty",
      iconImage: "assets/images/icons8-perfume.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:105ffbf7-a639-443c-ad48-36239fb822dd",
      active: true,
    },
    {
      title: "jewellery",
      iconImage: "assets/images/icon-jewellery.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:79f78a36-2f7b-442c-989a-48a83d76d422",
      active: true,
    },
    {
      title: "bank",
      iconImage: "assets/images/icons8-bank-building.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:e23ab7ec-7a87-4f17-be9a-a5f579d49ee1",
      active: true,
    },
    {
      title: "cafe",
      iconImage: "assets/images/icons8-coffee-beans.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:875d9cfb-8289-4307-9c1c-34b4f52198cb",
      active: true,
    },
    {
      title: "fast-food",
      iconImage: "assets/images/icons8-hamburger.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:028b17c6-2f82-4ce1-af3d-9fc9ca061972",
      active: true,
    },
    {
      title: "restaurant",
      iconImage: "assets/images/icons8-tableware.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:bda780fb-0f4a-4e76-b74c-a11f1975f1b5",
      active: true,
    },
    {
      title: "deli",
      iconImage: "assets/images/icons8-chocolate.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:6e75e80a-583b-4302-b410-f03f2431dc47",
      active: true,
    },
    {
      title: "fun",
      iconImage: "assets/images/icons8-smiling.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:cad88ce9-92d8-4137-ae61-82ac1fb5cf22",
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
