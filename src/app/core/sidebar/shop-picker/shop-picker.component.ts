import { Component, OnInit } from '@angular/core';
import { AmenityToggleModel } from '../../amenity-toggle.model';
import { SidebarService } from '../sidebar.service';

@Component({
  selector: 'app-shop-picker',
  templateUrl: './shop-picker.component.html',
  styleUrls: ['./shop-picker.component.scss']
})
export class ShopPickerComponent implements OnInit {
  sidebarOpened = true;
  data: AmenityToggleModel[] = [{
    title: 'Cafés',
    icon: ['fal', 'coffee'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:c693d414-4613-4c6c-95da-771e52759873',
    active: true
  }, {
    title: 'Clothing',
    icon: ['fal', 'tshirt'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:d111c5e4-1a63-48b3-94de-5fa7b309daaf',
    active: true
  }, {
    title: 'Groceries',
    icon: ['fal', 'shopping-cart'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:da5435e2-9179-4ca6-86e4-652b7e8d109b',
    active: true
  }, {
    title: 'Restaurants',
    icon: ['fal', 'utensils'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:c96e80d7-6683-4ca0-bc64-b6ed3fc824e2',
    active: true
  }, {
    title: 'Shoes',
    icon: ['fal', 'boot'],
    id: '44010f6f-9963-4433-ad86-40b89b829c41:f62dd757-4057-4015-97a0-c66d8934f7d8',
    active: true
  }];

  constructor(private sidebarService: SidebarService) { }

  ngOnInit() {

  }

  onFilterClick(item: AmenityToggleModel) {
    item.active = !item.active;
    this.sidebarService.onAmenityToggle(item);
  }

}
