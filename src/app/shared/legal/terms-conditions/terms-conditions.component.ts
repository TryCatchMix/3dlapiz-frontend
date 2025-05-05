import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss']
})
export class TermsConditionsComponent {
  currentYear = new Date().getFullYear();
  lastUpdated = new Date().toLocaleDateString('es-ES');
  showContactInfo = false;

  toggleContactInfo() {
    this.showContactInfo = !this.showContactInfo;
  }
}
