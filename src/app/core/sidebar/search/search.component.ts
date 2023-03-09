import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import * as removeAccents from "remove-accents";
import { MapService } from "src/app/map/map.service";
import { SidebarService } from "../sidebar.service";
import Keyboard from "simple-keyboard";
import { StateService } from "../../state.service";
import { NgSelectComponent } from "@ng-select/ng-select";

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
  keyboard: Keyboard;
  @ViewChild("select", { static: true }) ngSelect!: NgSelectComponent;

  constructor(
    public sidebarService: SidebarService,
    private elRef: ElementRef,
    public mapService: MapService,
    private translateService: TranslateService,
    private stateService: StateService
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
    if (this.stateService.state.kioskMode && !this.keyboard?.initialized) {
      this.keyboard = new Keyboard({
        preventMouseDownDefault: true,
        onChange: (input) => this.onChange(input),
        onKeyPress: (button) => this.onKeyPress(button),
      });
    }
  }

  onChange = (input: string) => {
    this.ngSelect.filter(input);
  };

  onKeyPress = (button: string) => {
    if (button === "{shift}" || button === "{lock}") this.handleShift();
  };

  handleShift = () => {
    let currentLayout = this.keyboard.options.layoutName;
    let shiftToggle = currentLayout === "default" ? "shift" : "default";

    this.keyboard.setOptions({
      layoutName: shiftToggle,
    });
  };

  onSearch(result) {
    if (this.stateService.state.kioskMode && this.keyboard?.initialized) {
      this.keyboard.setInput(result.term);
    }
    this.optionsOpen = result.term.length > 0;
  }

  onSelect(result, select) {
    this.sidebarService.onSetEndPoi(result);
    setTimeout(() => {
      this.selectedPoi = null;
      this.searchOpen = false;
      this.optionsOpen = false;
      select.blur();
      if (this.stateService.state.kioskMode) {
        this.keyboard.destroy();
      }
    });
  }

  customSearchFn(term: string, item) {
    const details =
      item.properties.description_i18n &&
      item.properties.description_i18n[currentLanguage]
        ? item.properties.description_i18n[currentLanguage]
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
    if (this.stateService.state.kioskMode) {
      this.keyboard.destroy();
    }
  }
}
