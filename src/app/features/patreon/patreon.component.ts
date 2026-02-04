import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-patreon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patreon.component.html',
})
export class PatreonComponent {
  patreonUrl = 'https://www.patreon.com/3d.lapiz';

  plans = [
    {
      name: 'Lápiz',
      price: '2 $ / mes',
      description: [
        'A little support to help us improve and keep this project alive',
        'Vote for next month’s new couple figure',
        'Sketch of the new figure',
        'Suggestion for a new couple for the vote',
        'Process images',
        'Starter Pack Chibis STL: Luz y Amity',
        'Acceso a Discord'
      ],
      highlight: false,
    },
    {
      name: 'Brush',
      price: '6,50 $ / mes',
      recommended: true,
      description: [
        '2 new STL character models every month',
        'A new couple model STL this month',
        'Starter Pack STL files',
        'Vote for next month’s new couple figure',
        'Sketch of the new figure',
        'Process images',
        'Acceso a Discord'
      ],
      highlight: true,
    },
    {
      name: 'Airbrush',
      price: '10 $ / mes',
      description: [
        'Extra STL Huntrix',
        'Monthly STL from old catalog',
        'New couple model STL this month',
        '2 new STL character models every month',
        'Vote for next month’s new couple figure',
        'Process images',
        'Acceso a Discord'
      ],
      highlight: false,
    },
  ];
}
