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
      id: [
        "75698d35-0918-4a2b-a8ab-77b93a618e61:c302b098-4c76-4a70-ae7c-5a0349e86fda",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:02c3ff3a-f21e-4acc-a193-33f4eec3c80e",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:d266e799-49a5-49c7-a37a-0426feaabb13",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:2c71be41-704d-4389-b78a-d7b9cc53dff5",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:9fdc16b9-6d74-41e2-8453-197a28242906",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:762bcc6b-34f4-43c2-9c5a-0c8748d0656b",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:a134605e-fe37-4845-92d0-2cf09333b04e",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:0fa149b7-aa6f-42ac-8c8d-7ceae2a96266",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:8a12fbd5-ebb5-4d95-b9e1-3acd28443c9d",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:0a7e293f-750c-499a-8308-91bc253612ef",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:318ed8dc-72ac-4bd6-bb07-22842a9dbe46",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:f480f5f2-f5b7-4944-9e3d-c4baf78e490e",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:07348f3c-6b80-4e7b-a48d-935ae3ef71f8",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:cfd608b1-fe61-4bea-92db-82a848452a45",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:b156c461-815a-4b31-b99d-9a49c75d6783",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:34a40a9b-a4a0-4977-8270-96b04e137fa4",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:f7779ed1-af05-4fa7-b01a-abbd5d9a301d",
      ],
      active: true,
    },
    {
      title: "grocery",
      iconImage: "assets/images/icons8-ingredients.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:d45449cb-1fa9-473f-a1d5-b7c2077b1cf5",
      active: true,
    },
    {
      title: "health",
      iconImage: "assets/images/icons8-caduceus.svg",
      id: [
        "75698d35-0918-4a2b-a8ab-77b93a618e61:69d2e19b-fb17-4cd6-966f-1f86f4930122",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:43b3fe55-f30e-4e5c-a0d5-b17994b45425",
      ],
      active: true,
    },
    {
      title: "eyewear",
      iconImage: "assets/images/icons8-glasses.svg",
      id: [
        "75698d35-0918-4a2b-a8ab-77b93a618e61:28d180c2-1d18-4b07-bf4d-3646314b7c80",
      ],
      active: true,
    },
    {
      title: "fitness",
      iconImage: "assets/images/icons8-weightlifting.svg",
      id: [
        "75698d35-0918-4a2b-a8ab-77b93a618e61:ee26e3bc-4911-4843-803b-d109e6f57742",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:4d0ebef8-e0aa-411e-b386-0f038725a609",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:9b579881-7911-4950-9146-504f270ccbed",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:03a45c5d-fb77-43bb-81e2-c6a61868aae8",
      ],
      active: true,
    },
    {
      title: "travel",
      iconImage: "assets/images/icons8-carry-on-luggage.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:109fe182-045f-4db7-bfd8-fd2937a5fc87",
      active: true,
    },
    {
      title: "books",
      iconImage: "assets/images/icons8-saddle-stitched-booklet.svg",
      id: [
        "75698d35-0918-4a2b-a8ab-77b93a618e61:b87bc5ce-def9-4a62-a78a-a38b7ac787a6",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:93d07ff1-c0ab-4152-b9e0-a662990cfa47",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:ecf63da4-81af-45bf-9450-80eadcc395a5",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:5e8bc3fa-26f4-4665-8d40-24dce81fd1f8",
      ],
      active: true,
    },
    {
      title: "luxury",
      iconImage: "assets/images/icons8-jewel.svg",
      id: [
        "75698d35-0918-4a2b-a8ab-77b93a618e61:53590614-9aa0-4afa-8b8b-cfa3136b316e",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:94390ef9-225b-4f64-ab7a-f17c97bd1326",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:2bd51ef9-dbc5-4381-8d33-f3de329d6e8c",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:c401b23f-4686-4f0f-9dfe-549040cfd795",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:414ad1ea-aec5-4154-b993-0b6a1f0cae36",
      ],
      active: true,
    },
    {
      title: "electronics",
      iconImage: "assets/images/icons8-airpods-pro-max.svg",
      id: [
        "75698d35-0918-4a2b-a8ab-77b93a618e61:022da10b-611a-4933-9929-4c4a9e2151f6",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:a4a01be9-70cf-4a32-9b15-b693214009aa",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:fe08a39f-701d-4655-80f9-8906517f2f3f",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:c078687b-c3df-4add-9b30-c0ac4e0af53a",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:309fd758-72c7-4e4a-8516-fbc4c17da024",
      ],
      active: true,
    },
    {
      title: "home",
      iconImage: "assets/images/icons8-lounge.svg",
      id: [
        "75698d35-0918-4a2b-a8ab-77b93a618e61:39a12b78-31a1-4d54-92b9-b117e6d7ab38",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:6f4db4db-5c96-4414-a3da-bbc79a23e773",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:abf57b7c-7216-4ade-bd30-e035bd2caa91",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:7d693561-a427-49e3-9a64-b3a687653407",
      ],
      active: true,
    },
    {
      title: "beauty",
      iconImage: "assets/images/icons8-perfume.svg",
      id: [
        "75698d35-0918-4a2b-a8ab-77b93a618e61:d812b45f-5257-4a50-ac08-1e2b4d269116",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:dd55ddd1-bff7-4897-8b54-ea31cda687ae",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:1b4e2f00-15d3-4d44-8b44-586150ccbcb0",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:93e2af3a-af5f-4e33-b8be-e9d0612afb36",
      ],
      active: true,
    },
    {
      title: "jewellery",
      iconImage: "assets/images/icons8-watches-front-view.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:7c7a6e4d-9a5c-44d6-b9ac-298d606ce126",
      active: true,
    },
    {
      title: "bank",
      iconImage: "assets/images/icons8-bank-building.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:d460413e-857a-4d91-b5dd-43ca0937228b",
      active: true,
    },
    {
      title: "cafe",
      iconImage: "assets/images/icons8-coffee-beans.svg",
      id: [
        "75698d35-0918-4a2b-a8ab-77b93a618e61:091f4137-6ca6-436c-ab04-20a5e964568f",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:4add7c35-f7bd-4f96-b268-5eddef2b126b",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:62bba064-81e3-4d87-a5a7-2d0300d2a105",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:d122b55f-2a31-460e-8976-ccc946f08e57",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:5d6f205c-1195-44ac-bdcd-a4bfc79614fc",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:6e11302a-65df-4497-81dc-d7572486f911",
      ],
      active: true,
    },
    {
      title: "fast-food",
      iconImage: "assets/images/icons8-hamburger.svg",
      id: [
        "75698d35-0918-4a2b-a8ab-77b93a618e61:276391e6-6dfa-413a-8e6a-3276bfa673d0",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:89df401a-e85b-4c17-8132-9011eefc9175",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:8d72b125-1575-40f8-82cf-0359a84bc8db",
      ],
      active: true,
    },
    {
      title: "restaurant",
      iconImage: "assets/images/icons8-tableware.svg",
      id: "75698d35-0918-4a2b-a8ab-77b93a618e61:15b182b8-9307-4185-8403-37858c557c63",
      active: true,
    },
    {
      title: "deli",
      iconImage: "assets/images/icons8-chocolate.svg",
      id: [
        "75698d35-0918-4a2b-a8ab-77b93a618e61:a5286ad2-527f-4bfd-a1c1-3cb13161fe69",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:9e6c9897-d430-4961-9de9-282bebc347c3",
      ],
      active: true,
    },
    {
      title: "fun",
      iconImage: "assets/images/icons8-smiling.svg",
      id: [
        "75698d35-0918-4a2b-a8ab-77b93a618e61:1b20689d-8db3-41bf-b42e-6a4c69a06c71",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:bb16e44a-d380-4e95-b9f3-67d5807d01d7",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:61ee55cc-c1e1-49ba-9379-b62df3c7f88e",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:84b627cb-3ffd-4bb8-803a-a4c165fcd368",
        "75698d35-0918-4a2b-a8ab-77b93a618e61:271c99fe-7532-4c0a-88b3-7da9bf019564",
      ],
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
