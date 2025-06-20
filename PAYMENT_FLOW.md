# Payment Flow Documentation

This document outlines the payment flow in the Digital Marketplace application.

## Payment Process Overview

1. **Cart to Checkout**:

   - User adds products to cart
   - User clicks "Proceed to Checkout" on CartSummary component
   - User is redirected to /checkout route

2. **Checkout Page**:

   - User enters shipping information
   - User selects address from saved addresses or adds a new one
   - User enters notes if any
   - User clicks "Proceed to Payment"
   - Checkout data is saved to localStorage
   - User is redirected to /checkout/payment route with required data

3. **Payment Page**:

   - User enters phone number for mobile money payment
   - Payment is initiated via PaymentForm component:
     - POST to /v1/azampay/checkout
     - Socket event "pushResponseReceived" is emitted
     - System waits for "azampayCallback" socket event
     - If no callback after 2 minutes, polling starts for payment status

4. **Payment Confirmation**:
   - When payment is confirmed (via socket or polling):
     - Order is created by sending POST to /v1/orders
     - Cart is cleared
     - User is redirected to order details page

## Component Structure

- **CartSummary**: Displays cart totals and "Proceed to Checkout" button
- **CheckoutPage**: Contains checkout form and address selection
- **PaymentPage**: Handles payment processing
- **PaymentForm**: Core component that handles payment initiation and status tracking
- **PaymentProcessor**: Wrapper around PaymentForm used by CheckoutPayment
- **CheckoutPayment**: Used in OrderCheckoutPage to display order details with payment
- **OrderCheckoutPage**: Shows order details after creation

## Data Flow

1. User inputs and selections in checkout form are saved to localStorage
2. Payment initiation sends amount and phone number to backend
3. On payment confirmation, the complete order data is sent to create the order:
   - Items from cart
   - Delivery option
   - Payment method
   - Payment details with transaction ID
   - Address ID
   - Notes
   - Transaction ID

## Socket Events

- **pushResponseReceived**: Emitted when payment is initiated
- **azampayCallback**: Received when payment status changes

## Fallback Mechanism

- If socket callback is not received after 2 minutes, the system falls back to polling
- Polling checks payment status every 5 seconds
- Both mechanisms update UI and proceed to order creation on success

## Success/Error Handling

- Success: Creates order, clears cart, redirects to order details
- Error: Shows appropriate error messages, allows user to retry payment
