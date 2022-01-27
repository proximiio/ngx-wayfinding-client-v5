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
    title: 'Toilet',
    icon: ['fal', 'toilet'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:e762ea14-70e2-49b7-9938-f6870f9ab18f',
    active: true
  }, {
    title: 'Accessible toilet',
    icon: ['fal', 'wheelchair'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:61042c8a-87a3-40e4-afa8-3a2c3c09fbf8',
    active: true
  }, {
    title: 'Baby changing',
    icon: ['fal', 'baby'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:62c605cc-75c0-449a-987c-3bdfef2c1642',
    active: true
  }, {
    title: 'Emergency care',
    icon: ['fal', 'stethoscope'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:57ef933b-ff2e-4db1-bc99-d21f2053abb2',
    active: true
  }, {
    title: 'ATM',
    icon: ['fal', 'money-bill'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:2cd016a5-8703-417c-af07-d49aef074ad3',
    active: true
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
