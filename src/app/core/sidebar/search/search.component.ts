import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { SidebarService } from "../sidebar.service";
import Keyboard from "simple-keyboard";
import { StateService } from "../../state.service";
import { NgSelectComponent } from "@ng-select/ng-select";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit {
  input;
  selectedPoi;
  pois;
  searchOpen = false;
  optionsOpen = false;
  keyboard: Keyboard;
  @ViewChild("select", { static: true }) ngSelect!: NgSelectComponent;

  constructor(
    public sidebarService: SidebarService,
    private stateService: StateService,
    private elRef: ElementRef
  ) {}

  ngOnInit() {
    this.input =
      this.elRef.nativeElement.children[0].children[2].children[0].children[0].children[1].children[0];
    const placeholder =
      this.elRef.nativeElement.children[0].children[2].children[0].children[0]
        .children[0];
    placeholder.id = "inputLabel";
    this.input.title = "Search";
    this.input.setAttribute("aria-labelledby", "inputLabel");
  }

  onSearchOpen() {
    this.pois = this.sidebarService.sortedPOIs;
    this.searchOpen = true;
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
