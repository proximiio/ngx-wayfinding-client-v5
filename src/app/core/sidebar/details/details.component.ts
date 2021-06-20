import { Component, OnDestroy, OnInit } from '@angular/core';
import { SidebarService } from '../sidebar.service';
import { StateService } from '../../state.service';
import { AuthService } from '../../../auth/auth.service';
import { Subscription } from 'rxjs';
import Feature from '../../../map/models/feature.model';

interface StepModel {
  bearingFromLastStep: number;
  coordinates: { coordinates: [number, number] };
  direction: string;
  distanceFromLastStep: number;
  instruction?: string[];
  isWaypoint: boolean;
  level: number;
  levelChangerId: string;
  lineStringFeatureFromLastStep: Feature;
  waypointId: string;
}

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  poi;
  showInstructions = false;
  steps = [];
  details = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
  limit = 200;
  showingMore = false;
  private sub: Subscription;

  constructor(
    private authService: AuthService,
    public sidebarService: SidebarService,
    public stateService: StateService
  ) {
    this.poi = this.sidebarService.selectedEndPoi;
  }

  ngOnInit() {
    this.sub = this.sidebarService.getEndPointListener().subscribe(poi => {
      if (poi) {
        this.poi = poi;
        if (this.poi.properties.metadata && this.poi.properties.metadata.description) {
          this.details = this.poi.properties.metadata.description.en;
        }
        if (this.stateService.state.textNavigation) {
          this.buildNavigationSteps(this.stateService.state.textNavigation.steps);
        }
      }
    });
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

  getImageUrl() {
    return `https://api.proximi.fi/v5/geo/${this.poi.properties.images[0]}?token=${this.authService.getToken()}`;
  }

  getOpenHours() {
    const d = new Date();
    const weekDay = d.getDay();

    if (this.poi.properties.metadata && this.poi.properties.metadata.openHours && this.poi.properties.metadata.openHours[weekDay].en) {
      return this.poi.properties.metadata.openHours[weekDay].en;
    } else {
      return 'No open hours available';
    }
  }

  buildNavigationSteps(steps: StepModel[]) {
    steps = steps.filter(i => i.instruction);
    this.steps = steps.map((step: StepModel) => {
      let directionIcon;
      let stepIcon;
      switch (step.direction) {
        case 'LEFT': {
          directionIcon = 'arrow-left';
          stepIcon = 'shoe-prints';
          break;
        }
        case 'SLIGHT_LEFT': {
          directionIcon = 'arrow-left';
          stepIcon = 'shoe-prints';
          break;
        }
        case 'RIGHT': {
          directionIcon = 'arrow-right';
          stepIcon = 'shoe-prints';
          break;
        }
        case 'SLIGHT_RIGHT': {
          directionIcon = 'arrow-right';
          stepIcon = 'shoe-prints';
          break;
        }
        case 'UP_ESCALATOR': {
          directionIcon = 'arrow-up';
          stepIcon = 'caret-square-up';
          break;
        }
        case 'DOWN_ESCALATOR': {
          directionIcon = 'arrow-up';
          stepIcon = 'caret-square-down';
          break;
        }
        case 'FINISH': {
          directionIcon = 'arrow-up';
          stepIcon = 'pennant';
          break;
        }
        default: {
          directionIcon = 'compass';
          stepIcon = 'shoe-prints';
          break;
        }
      }
      return {
        description: step.instruction.join(''),
        directionIcon: ['fal', directionIcon],
        stepIcon: ['fal', stepIcon]
      };
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
