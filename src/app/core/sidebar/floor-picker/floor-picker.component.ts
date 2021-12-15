import { Component, OnInit } from '@angular/core';
import { StateService } from '../../state.service';
import { SidebarService } from '../sidebar.service';
import { FloorModel } from 'proximiio-js-library/lib/models/floor';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-floor-picker',
  templateUrl: './floor-picker.component.html',
  styleUrls: ['./floor-picker.component.scss']
})
export class FloorPickerComponent implements OnInit {
  sidebarOpened = true;
  pickerOpened = false;

  constructor(
    private sidebarService: SidebarService,
    public stateService: StateService,
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

  onFloorChange(way: string) {
    this.sidebarService.floorChangeListener.next(way);
  }

  onFloorPick(floor: FloorModel) {
    this.sidebarService.floorChangeListener.next(floor as FloorModel);
  }
}
