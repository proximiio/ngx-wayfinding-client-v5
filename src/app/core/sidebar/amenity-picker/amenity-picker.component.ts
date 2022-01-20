import { Component, OnInit } from '@angular/core';
import { AmenityToggleModel } from '../../amenity-toggle.model';
import { SidebarService } from '../sidebar.service';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-amenity-picker',
  templateUrl: './amenity-picker.component.html',
  styleUrls: ['./amenity-picker.component.scss']
})
export class AmenityPickerComponent implements OnInit {
  sidebarOpened = true;
  data: AmenityToggleModel[] = [{
    title: 'Toilet', // category title
    icon: ['fal', 'toilet'], // category fontAwesome icon, please add in fontawesome.module.ts in case it's missing
    id: 'amenity-id', // amenity id, must be the same as defined in setAmenityCategory method
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
      if (item.active && this.sidebarService.filteredAmenity === item.id) {
        i.active = true;
      } else {
        i.active = item.id === i.id;
      }
    }
    // will do some job at sidebarService, two arguments are expected, category title (same as was defined in setAmenityCategory method) and amenity id
    this.sidebarService.onAmenityToggle('amenities', item.id);
  }

}
