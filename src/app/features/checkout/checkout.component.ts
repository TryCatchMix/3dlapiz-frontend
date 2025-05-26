import { ActivatedRoute, Router } from '@angular/router';
import { CartItem, CartService } from '../../core/services/cart.service';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { StripeService } from '../../core/services/stripe.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  shippingForm!: FormGroup;
  currentStep = 1;
  isSubmitting = false;

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
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
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
      country: [user?.country_code || 'España', Validators.required],
      phone: [
        user?.phone_number || '',
        [Validators.required, Validators.pattern(/^\d{9}$/)],
      ],
    });
  }

  selectShippingMethod(method: any): void {
    this.selectedShippingMethod = method;
  }

  getTotal(): number {
    return this.cartService.cartTotal() + this.selectedShippingMethod.price;
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
      shipping_method: this.selectedShippingMethod,
      items: this.cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        image_url: item.image_url,
      })),
      total: this.getTotal(),
     success_url: `${window.location.origin}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/cart`,
    };

    this.stripeService.createPaymentSession(orderData).subscribe({
      next: async (response) => {
        this.isSubmitting = false;

        if (response && response.session_id) {
          const result = await this.stripeService.redirectToCheckout(
            response.session_id
          );
          if (result && result.error) {
            console.error('Error al redirigir a Stripe:', result.error);
          }
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error al crear la sesión de pago', error);
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
}
