import { ActivatedRoute, Router } from '@angular/router';
import { CartItem, CartService } from '../../core/services/cart.service';
import { Component, OnInit, inject } from '@angular/core';
import {
  CountryOption,
  getCountryOptions,
} from '../../shared/utils/countries.util';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PriceEurPipe } from '../../shared/pipes/price-eur.pipe';
import { ShippingService } from '../../core/services/shipping.service';
import { StripeService } from '../../core/services/stripe.service';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

interface AppliedDiscount {
  code: string;
  percentage: number;
  discount_amount: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    PriceEurPipe,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  private http = inject(HttpClient);

  countries: CountryOption[] = getCountryOptions();
  shippingPrice = 0;
  isLoadingShipping = false;
  cartItems: CartItem[] = [];
  shippingForm!: FormGroup;
  currentStep = 1;
  isSubmitting = false;

  // Descuento
  discountCode = '';
  appliedDiscount: AppliedDiscount | null = null;
  validatingDiscount = false;
  discountError = '';

  selectedShippingMethod = {
    id: 1,
    name: 'Envío Estándar',
    price: 5.99,
    estimatedDelivery: '3-5 días hábiles',
  };

  shippingMethods = [
    {
      id: 1,
      name: 'Envío Estándar',
      price: 5.99,
      estimatedDelivery: '3-5 días hábiles',
    },
    {
      id: 2,
      name: 'Envío Express',
      price: 12.99,
      estimatedDelivery: '1-2 días hábiles',
    },
  ];

  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private stripeService: StripeService,
    private shippingService: ShippingService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/checkout' },
      });
      return;
    }

    this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
      if (items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });

    this.initShippingForm();

    this.route.queryParams.subscribe((params) => {
      if (params['session_id']) {
        this.confirmPayment(params['session_id']);
      }
    });
  }

  private initShippingForm(): void {
    const user = this.authService.currentUser();

    this.shippingForm = this.fb.group({
      fullName: [
        user ? `${user.first_name} ${user.last_name}` : '',
        Validators.required,
      ],
      email: [user?.email || '', [Validators.required, Validators.email]],
      address: [user?.street || '', Validators.required],
      city: [user?.city || '', Validators.required],
      postalCode: [user?.postal_code || '', Validators.required],
      country_code: [
        user?.country_code?.toUpperCase() || 'ES',
        [Validators.required, Validators.pattern(/^[A-Z]{2}$/)],
      ],
      phone: [
        user?.phone_number || '',
        [Validators.required, Validators.pattern(/^\+?[\d\s\-().]{7,20}$/)],
      ],
    });

    // Calcular precio inicial y al cambiar país
    this.recalcShipping(this.shippingForm.value.country_code);
    this.shippingForm.get('country_code')!.valueChanges.subscribe((code) => {
      this.recalcShipping(code);
    });
  }

  private recalcShipping(code: string | null): void {
    if (!code) {
      this.shippingPrice = 0;
      return;
    }
    this.isLoadingShipping = true;
    this.shippingService.calculate(code).subscribe((quote) => {
      this.shippingPrice = quote.price;
      this.isLoadingShipping = false;
    });
  }

  // ---- Descuento ----

  applyDiscount(): void {
    const code = this.discountCode.trim().toUpperCase();
    if (!code) return;

    this.validatingDiscount = true;
    this.discountError = '';

    this.http
      .post<AppliedDiscount>(`${environment.API_URL}/discounts/validate`, {
        code,
        subtotal: this.cartService.cartTotal(),
      })
      .subscribe({
        next: (res) => {
          this.appliedDiscount = res;
          this.validatingDiscount = false;
        },
        error: (err) => {
          this.discountError = err.error?.message ?? 'Código no válido';
          this.validatingDiscount = false;
        },
      });
  }

  removeDiscount(): void {
    this.appliedDiscount = null;
    this.discountCode = '';
    this.discountError = '';
  }

  // ---- Totales ----

  getTotal(): number {
    const subtotal = this.cartService.cartTotal();
    const discount = this.appliedDiscount?.discount_amount ?? 0;
    return Math.max(0, subtotal - discount + this.shippingPrice);
  }

  // ---- Métodos existentes ----

  selectShippingMethod(method: any): void {
    this.selectedShippingMethod = method;
  }

  nextStep(): void {
    if (this.shippingForm.valid) {
      this.proceedToStripeCheckout();
    } else {
      this.shippingForm.markAllAsTouched();
    }
  }

  proceedToStripeCheckout(): void {
    this.isSubmitting = true;

    const orderData = {
      shipping_info: this.shippingForm.value,
      items: this.cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        variant: item.variant,
      })),
      discount_code: this.appliedDiscount?.code ?? null,
    };

    this.stripeService.createPaymentSession(orderData).subscribe({
      next: async (response) => {
        this.isSubmitting = false;
        if (response?.session_id) {
          const result = await this.stripeService.redirectToCheckout(
            response.session_id,
          );
          if (result?.error)
            console.error('Error al redirigir a Stripe:', result.error);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error al crear la sesión de pago', err);
      },
    });
  }

  private confirmPayment(sessionId: string): void {
    this.isSubmitting = true;

    this.stripeService.confirmPayment(sessionId).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (response && response.success) {
          this.cartService.clearCart();
          this.router.navigate(['/order-success'], {
            state: { order: response.order },
            queryParams: {},
          });
        } else {
          console.error('Error al confirmar el pago');
          this.router.navigate(['/cart']);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error al confirmar el pago', error);
        this.router.navigate(['/cart']);
      },
    });
  }

  imgUrl(path?: string): string {
    if (!path)
      return `${environment.STATIC_URL}/images/default-placeholder.jpg`;
    return `${environment.STATIC_URL}/${path}`;
  }
}
