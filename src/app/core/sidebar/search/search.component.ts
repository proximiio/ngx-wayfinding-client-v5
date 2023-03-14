import { Component, ElementRef, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import * as removeAccents from "remove-accents";
import { MapService } from "src/app/map/map.service";
import { SidebarService } from "../sidebar.service";

let currentLanguage = "en";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit {
  selectedPoi;
  pois;
  searchOpen = false;
  optionsOpen = false;

  constructor(
    public sidebarService: SidebarService,
    private elRef: ElementRef,
    public mapService: MapService,
    private translateService: TranslateService
  ) {
    currentLanguage = this.translateService.currentLang;
  }

  ngOnInit() {
    const input =
      this.elRef.nativeElement.children[0].children[2].children[0].children[0]
        .children[1].children[0];
    const placeholder =
      this.elRef.nativeElement.children[0].children[2].children[0].children[0]
        .children[0];
    placeholder.id = "inputLabel";
    input.title = "Search";
    input.setAttribute("aria-labelledby", "inputLabel");
  }

  onSearchOpen() {
    if (this.mapService.mapReady) {
      this.searchOpen = true;
    }
  }

  onSearch(result) {
    this.optionsOpen = result.term.length > 0;
    this.pois = this.sidebarService.sortedPOIs
      .map((item) => {
        const details =
          item.properties?.description_i18n &&
          item.properties?.description_i18n[currentLanguage]
            ? item.properties.description_i18n[currentLanguage]
            : item.properties.description_i18n?.en;
        const title = removeAccents(item.properties?.title);
        const term = removeAccents(result.term.toLowerCase());
        if (
          title.toLowerCase().indexOf(term) > -1 ||
          details?.toLowerCase().indexOf(term) > -1
        ) {
          if (title.toLowerCase().startsWith(term)) {
            item.score = 9;
          } else if (title.toLowerCase().indexOf(term) > -1) {
            item.score = 1;
          } else if (details?.toLowerCase().indexOf(term) > -1) {
            item.score = 0;
            item.foundInDescription = true;
          }
          return item;
        }
      })
      .filter((i) => i)
      .sort(
        (a, b) =>
          b.score - a.score ||
          (a.properties.title > b.properties.title ? 1 : -1)
      );
  }

  onSelect(result, select) {
    this.sidebarService.onSetEndPoi(result);
    setTimeout(() => {
      this.selectedPoi = null;
      this.searchOpen = false;
      this.optionsOpen = false;
      select.blur();
    });
  }

  onClose(select) {
    select.close();
    select.blur();
    select.searchTerm = null;
    this.searchOpen = false;
    this.optionsOpen = false;
  }
}
