import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from "./components/home/home.component";
import { CardComponent } from "./components/card/card.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HomeComponent, CardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'CardCutta';
}
