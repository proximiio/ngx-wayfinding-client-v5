import { Component, OnInit } from "@angular/core";
import { MapService } from "src/app/map/map.service";
import { SidebarService } from "./sidebar.service";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  filtersOpened = true;
  constructor(
    public sidebarService: SidebarService,
    public mapService: MapService
  ) {}

  ngOnInit() {}
}
