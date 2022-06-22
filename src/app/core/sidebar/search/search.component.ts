import { Component, ElementRef, OnInit } from '@angular/core';
import { SidebarService } from '../sidebar.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  selectedPoi;
  pois;
  searchOpen = false;
  optionsOpen = false;

  constructor(public sidebarService: SidebarService, private elRef: ElementRef) {}

  ngOnInit() {
    const input = this.elRef.nativeElement.children[0].children[2].children[0].children[0].children[1].children[0];
    const placeholder = this.elRef.nativeElement.children[0].children[2].children[0].children[0].children[0];
    placeholder.id = 'inputLabel';
    input.title = 'Search';
    input.setAttribute('aria-labelledby', 'inputLabel');
  }

  onSearchOpen() {
    this.pois = this.sidebarService.sortedPOIs;
    this.searchOpen = true;
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

  onClose(select) {
    select.close();
    select.blur();
    select.searchTerm = null;
    this.searchOpen = false;
    this.optionsOpen = false;
  }
}
