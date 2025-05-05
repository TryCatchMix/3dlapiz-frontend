import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .not-found-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: linear-gradient(to right, #ff758c, #ff7eb3);
      font-family: 'Arial', sans-serif;
      color: white;
      text-align: center;
    }

    .emoji {
      font-size: 8rem;
      margin-bottom: 1rem;
      animation: wobble 2s infinite;
    }

    .title {
      font-size: 3rem;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .message {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      max-width: 600px;
    }

    .home-button {
      background-color: white;
      color: #ff758c;
      border: none;
      border-radius: 50px;
      padding: 12px 30px;
      font-size: 1.2rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .home-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
      background-color: #fff0f5;
    }

    @keyframes wobble {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(5deg); }
      50% { transform: rotate(-5deg); }
      75% { transform: rotate(5deg); }
    }

    .flirty-message {
      font-style: italic;
      margin-top: 2rem;
      font-size: 1.1rem;
      opacity: 0.8;
    }
  `],
  template: `
    <div class="not-found-container">
      <div class="emoji">💋</div>
      <h1 class="title">¡Ups, página no encontrada!</h1>
      <p class="message">Parece que te has perdido, cariño... pero no te preocupes, siempre puedes volver a mis brazos.</p>
      <button routerLink="/" class="home-button">Volver al inicio</button>
      <p class="flirty-message">Esta página está jugando al escondite... ¿quieres jugar a algo más divertido?</p>
    </div>
  `
})
export class NotFoundComponent {
  constructor() {
    console.log('Buscando amor en la ruta equivocada? 💅');
  }
}
