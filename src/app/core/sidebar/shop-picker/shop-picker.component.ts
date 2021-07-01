import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shop-picker',
  templateUrl: './shop-picker.component.html',
  styleUrls: ['./shop-picker.component.scss']
})
export class ShopPickerComponent implements OnInit {
  sidebarOpened = true;
  data = [{
    title: 'Cafés',
    icon: ['fal', 'coffee']
  }, {
    title: 'Clothing',
    icon: ['fal', 'tshirt']
  }, {
    title: 'Groceries',
    icon: ['fal', 'shopping-cart']
  }, {
    title: 'Restaurants',
    icon: ['fal', 'utensils']
  }, {
    title: 'Shoes',
    icon: ['fal', 'boot']
  }];

  constructor() { }

  ngOnInit() {
  }

}
