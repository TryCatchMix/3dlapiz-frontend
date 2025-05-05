import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {
  currentYear = new Date().getFullYear();
  lastUpdated = new Date().toLocaleDateString('es-ES');
  showContactInfo = false;

  toggleContactInfo() {
    this.showContactInfo = !this.showContactInfo;
  }
}
