import { Component, OnInit } from '@angular/core';
import { StateService } from '../../state.service';
import { SidebarService } from '../sidebar.service';
import Floor from '../../../map/models/floor.model';

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
    public stateService: StateService
  ) { }

  ngOnInit() {
  }

  onFloorChange(way: string) {
    this.sidebarService.floorChangeListener.next(way);
  }

  onFloorPick(floor: Floor) {
    this.sidebarService.floorChangeListener.next(floor);
  }
}
