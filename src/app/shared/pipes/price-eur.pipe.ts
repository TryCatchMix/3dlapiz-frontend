import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../../core/services/currency.service';

@Pipe({
  name: 'priceEur',
  standalone: true,
  pure: false,  // se actualiza cuando cambias la moneda
})
export class PriceEurPipe implements PipeTransform {
  private cs = inject(CurrencyService);

  transform(value: number | string | null | undefined): string {
    return this.cs.format(value);
  }
}
