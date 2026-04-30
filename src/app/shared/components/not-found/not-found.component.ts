import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [],
  template: `
   <div class="min-h-screen flex items-center justify-center bg-pageBg font-sans text-ink px-6">
  <div class="text-center max-w-xl">

    <!-- Código 404 -->
    <h1 class="text-8xl font-serif text-primaryText">404</h1>

    <!-- Mensaje principal -->
    <h2 class="mt-4 text-3xl font-serif text-accentText">
      Página no encontrada
    </h2>

    <!-- Descripción -->
    <p class="mt-4 text-inkSoft text-lg">
      Parece que esta figura se ha perdido en el proceso de impresión 🖨️
      La página que buscas no existe o ha sido movida.
    </p>

    <!-- Decoración -->
    <div class="mt-8 flex justify-center items-center gap-2">
      <span class="w-3 h-3 bg-primaryText rounded-full animate-pulseDot"></span>
      <span class="w-3 h-3 bg-accentText rounded-full animate-pulseDot [animation-delay:.2s]"></span>
      <span class="w-3 h-3 bg-inkSoft rounded-full animate-pulseDot [animation-delay:.4s]"></span>
    </div>

    <!-- Botón -->
    <div class="mt-10">
      <a
        routerLink="/"
        class="inline-block px-6 py-3 bg-primaryBg text-ink font-medium rounded-2xl shadow-md hover:bg-primaryHover transition"
      >
        Volver a la tienda
      </a>
    </div>

  </div>
</div>
  `
})
export class NotFoundComponent {
  constructor() {
    console.log('Buscando amor en la ruta equivocada? 💅');
  }
}
