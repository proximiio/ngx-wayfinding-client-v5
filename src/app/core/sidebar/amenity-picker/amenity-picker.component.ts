import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-amenity-picker',
  templateUrl: './amenity-picker.component.html',
  styleUrls: ['./amenity-picker.component.scss']
})
export class AmenityPickerComponent implements OnInit {
  sidebarOpened = true;
  data = [{
    title: 'Toilet',
    icon: ['fal', 'toilet']
  }, {
    title: 'Accessible toilet',
    icon: ['fal', 'wheelchair']
  }, {
    title: 'Baby changing',
    icon: ['fal', 'baby']
  }, {
    title: 'Emergency care',
    icon: ['fal', 'stethoscope']
  }, {
    title: 'ATM',
    icon: ['fal', 'money-bill']
  }];

  constructor() { }

  ngOnInit() {
  }

}
