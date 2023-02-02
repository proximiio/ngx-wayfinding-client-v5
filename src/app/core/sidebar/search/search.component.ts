import { Component, ElementRef, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import * as removeAccents from "remove-accents";
import { MapService } from "src/app/map/map.service";
import { SidebarService } from "../sidebar.service";

let currentLanguage = 'en';

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
    private translateService: TranslateService,
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
      this.pois = this.sidebarService.sortedPOIs;
      this.searchOpen = true;
    }
  }

  onSearch(result) {
    this.optionsOpen = result.term.length > 0;
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

  customSearchFn(term: string, item) {
    const details = item.properties.description_i18n && item.properties.description_i18n[
      currentLanguage
    ]
      ? item.properties.description_i18n[
          currentLanguage
        ]
      : item.properties.description_i18n?.en;
    term = removeAccents(term.toLowerCase());
    return (
      removeAccents(item.properties.title).toLowerCase().indexOf(term) > -1 ||
      details?.toLowerCase().indexOf(term) > -1
    );
  }

  onClose(select) {
    select.close();
    select.blur();
    select.searchTerm = null;
    this.searchOpen = false;
    this.optionsOpen = false;
  }
}
