import { NgModule } from '@angular/core';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faChevronUp,
  faChevronDown,
  faSearch,
  faDotCircle,
  faEllipsisVAlt,
  faEllipsisH,
  faEllipsisV,
  faTimesCircle,
  faTimes,
  faSearchLocation,
  faMapMarkerAlt,
  faWheelchair,
  faToggleOn,
  faToggleOff,
  faChevronRight,
  faChevronLeft,
  faChevronDoubleLeft,
  faChevronDoubleRight,
  faCoffee,
  faTshirt,
  faShoppingCart,
  faUtensils,
  faBoot,
  faToilet,
  faBaby,
  faStethoscope,
  faMoneyBill,
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faShoePrints,
  faSort,
  faPennant,
  faRoute,
  faAngleDown,
  faWalking, faAngleUp, faCog
} from '../vendor/pro-light-svg-icons';

@NgModule({
  exports: [
    FontAwesomeModule
  ]
})
export class FontawesomeModule {
  constructor(library: FaIconLibrary) {
    // Add an icon to the library for convenient access in other components
    library.addIcons(
      faChevronUp,
      faChevronDown,
      faChevronRight,
      faChevronLeft,
      faChevronDoubleLeft,
      faChevronDoubleRight,
      faSearch,
      faDotCircle,
      faEllipsisVAlt,
      faEllipsisH,
      faEllipsisV,
      faTimesCircle,
      faTimes,
      faSearchLocation,
      faMapMarkerAlt,
      faWheelchair,
      faToggleOff,
      faToggleOn,
      faCoffee,
      faTshirt,
      faShoppingCart,
      faUtensils,
      faBoot,
      faToilet,
      faBaby,
      faStethoscope,
      faMoneyBill,
      faArrowUp,
      faArrowDown,
      faArrowLeft,
      faArrowRight,
      faShoePrints,
      faSort,
      faPennant,
      faRoute,
      faAngleDown,
      faAngleUp,
      faWalking,
      faCog
    );
  }
}
