import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { StateService } from "../../state.service";
import { SidebarService } from "../sidebar.service";

@Component({
  selector: "app-list-view",
  templateUrl: "./list-view.component.html",
  styleUrls: ["./list-view.component.scss"],
})
export class ListViewComponent implements OnInit, OnDestroy {
  data;
  currentLanguage: string;
  private subs: Subscription[] = [];

  constructor(
    public sidebarService: SidebarService,
    private stateService: StateService,
    private translateService: TranslateService
  ) {
    this.currentLanguage = this.translateService.currentLang;
    this.subs.push(
      this.sidebarService.getAmenityToggleListener().subscribe((res) => {
        if (res && res.category === "shop") {
          this.data = this.stateService.state.allFeatures.features
            .filter(
              (i) =>
                (Array.isArray(res.amenityId)
                  ? res.amenityId.includes(i.properties.amenity)
                  : i.properties.amenity === res.amenityId) &&
                i.properties.type === "poi" &&
                i.properties.place_id === this.stateService.state.defaultPlaceId
            )
            .sort((a, b) => (a.properties.title > b.properties.title ? 1 : -1))
            // .sort((a, b) => (a.properties.level > b.properties.level ? 1 : -1))
            .map((i) => {
              i.properties.title =
                i.properties.title_i18n &&
                i.properties.title_i18n[this.currentLanguage]
                  ? i.properties.title_i18n[this.currentLanguage]
                  : i.properties.title;
              i.properties.floor_name = this.stateService.state.floors.find(
                (floor) => floor.id === i.properties.floor_id
              )?.name;
              return i;
            });
        }
      })
    );
  }

  ngOnInit() {}

  onClose() {
    this.sidebarService.onAmenityToggle(
      "shop",
      this.sidebarService.filteredShop
    );
    this.sidebarService.activeListItem = null;
  }

  onSelect(item) {
    this.sidebarService.onSetEndPoi(item);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
