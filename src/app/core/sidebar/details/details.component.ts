import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../sidebar.service';
import { StateService } from '../../state.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  showInstructions = false;
  steps = [{
    number: 0,
    description: 'Walk straight for 60 steps',
    directionIcon: ['fal', 'arrow-up'],
    stepIcon: ['fal', 'shoe-prints']
  }, {
    number: 1,
    description: 'Turn right and take elevator to 3rd floor',
    directionIcon: ['fal', 'arrow-right'],
    stepIcon: ['fal', 'sort']
  }, {
    number: 2,
    description: 'Turn left and walk 30 steps',
    directionIcon: ['fal', 'arrow-left'],
    stepIcon: ['fal', 'shoe-prints']
  }, {
    number: 3,
    description: 'Your destination is on the left',
    directionIcon: ['fal', 'arrow-left'],
    stepIcon: ['fal', 'pennant']
  }];
  details = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
  limit = 200;
  showingMore = false;
  constructor(
    public sidebarService: SidebarService,
    public stateService: StateService
  ) {}

  ngOnInit() {
  }

  onDetailsClose() {
    this.sidebarService.onSetEndPoi(null);
  }

  toggleInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  toggleAccessibleRoute() {
    this.sidebarService.onAccessibleRouteToggle();
  }
}
