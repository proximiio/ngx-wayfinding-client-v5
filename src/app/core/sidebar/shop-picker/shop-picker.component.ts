import { Component, OnInit } from '@angular/core';
import { AmenityToggleModel } from '../../amenity-toggle.model';
import { SidebarService } from '../sidebar.service';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-shop-picker',
  templateUrl: './shop-picker.component.html',
  styleUrls: ['./shop-picker.component.scss']
})
export class ShopPickerComponent implements OnInit {
  sidebarOpened = true;
  data: AmenityToggleModel[] = [{
    title: 'cafes', // category title
    icon: ['fal', 'coffee'], // category fontAwesome icon, please add in fontawesome.module.ts in case it's missing
    id: 'another-amenity-id', // amenity id, must be the same as defined in setAmenityCategory method
    active: true // set category as active
  }];

  constructor(
    private sidebarService: SidebarService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
      .subscribe((state: BreakpointState) => {
        this.sidebarOpened = !state.matches;
      });
  }

  ngOnInit() {

  }

  onFilterClick(item: AmenityToggleModel) {
    // handle active toggling
    for (const i of this.data) {
      if (item.active && this.sidebarService.filteredShop === item.id) {
        i.active = true;
      } else {
        i.active = item.id === i.id;
      }
    }
    // will do some job at sidebarService, two arguments are expected, category title (same as was defined in setAmenityCategory method) and amenity id
    this.sidebarService.onAmenityToggle('shop', item.id);
  }

}
