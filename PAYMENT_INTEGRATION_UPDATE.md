# Payment Integration Update - TanFishMarket

## Overview

Updated the checkout form to support two payment methods:

1. **Mobile Money** (via Azampay)
2. **Card Payment** (via Pesapal)

## Key Changes

### 1. Updated Payment Service (`paymentService.ts`)

- Added Pesapal payment interfaces:
  - `PesapalCreateOrderRequest`
  - `PesapalCreateOrderResponse`
  - `PesapalTransactionStatusResponse`
- Added new methods:
  - `createPesapalOrder()` - Creates order via `/v1/pesapal/create-order`
  - `checkPesapalTransactionStatus()` - Checks status via `/v1/pesapal/transaction-status/{trackingId}`

### 2. New Payment Method Selector Component (`PaymentMethodSelector.tsx`)

- Unified payment selection interface
- Handles both Mobile Money and Card payments
- Features:
  - Payment method selection UI
  - Mobile money form with phone validation
  - Card payment integration with Pesapal
  - Status checking for Pesapal transactions
  - Payment processing states

### 3. Updated Checkout Form (`CheckoutForm.tsx`)

- Removed payment method selection from checkout form
- Added payment flow on "Place Order" click
- Integration with `PaymentMethodSelector` component
- Simplified checkout process

## Payment Flows

### Mobile Money Flow (Azampay)

1. User selects Mobile Money
2. Enters phone number
3. Payment initiated via existing Azampay integration
4. Order created upon successful payment

### Card Payment Flow (Pesapal)

1. User selects Card Payment
2. System creates Pesapal order with billing address
3. User redirected to Pesapal payment page (opens in new window)
4. User completes payment on Pesapal
5. User returns and clicks "Check Payment Status"
6. System checks transaction status
7. Order created upon confirmed payment

## API Endpoints Used

### Pesapal Integration

- **Create Order**: `POST /v1/pesapal/create-order`
- **Check Status**: `GET /v1/pesapal/transaction-status/{trackingId}`

### Azampay Integration (Existing)

- **Initiate Payment**: `POST /azampay/checkout`
- **Check Status**: `GET /azampay/status/{referenceId}`

## Request/Response Formats

### Pesapal Create Order Request

```json
{
  "amount": 1000,
  "currency": "TZS",
  "description": "Payment for order #123456",
  "callbackUrl": "https://yourdomain.com/payment/success",
  "billingAddress": {
    "phone_number": "0712345678",
    "email_address": "customer@example.com",
    "country_code": "TZ",
    "first_name": "John",
    "middle_name": "Michael",
    "last_name": "Doe",
    "line_1": "123 Main Street",
    "line_2": "Apartment 4B",
    "city": "Nairobi",
    "state": "NRB",
    "postal_code": "00100",
    "zip_code": "00100"
  },
  "cancellationUrl": "https://yourdomain.com/payment/cancelled",
  "branch": "Tanfishmarket Website"
}
```

### Pesapal Create Order Response

```json
{
  "referenceId": "TANAB12CDFISH123456",
  "transactionId": "cuid_1234567890abcdef",
  "order_tracking_id": "b945e4af-80a5-4ec1-8706-e03f8332fb04",
  "redirect_url": "https://pay.pesapal.com/iframe/PesapalIframe3/Index/?OrderTrackingId=b945e4af-80a5-4ec1-8706-e03f8332fb04",
  "error": null,
  "status": "200"
}
```

### Pesapal Transaction Status Response

```json
{
  "payment_method": "TIGOTZ",
  "amount": 1000,
  "created_date": "2025-07-29T14:44:58.587",
  "confirmation_code": "25291117871118",
  "order_tracking_id": "e1532d2f-77e2-4630-807b-db835bbf20d6",
  "payment_status_description": "Completed",
  "description": null,
  "message": "Request processed successfully",
  "payment_account": "2556xxx47688",
  "call_back_url": "https://yourdomain.com/payment/callback?OrderTrackingId=e1532d2f-77e2-4630-807b-db835bbf20d6&OrderMerchantReference=ORDER123456",
  "status_code": 1,
  "merchant_reference": "ORDER123456",
  "account_number": null,
  "payment_status_code": "",
  "currency": "TZS",
  "error": {
    "error_type": null,
    "code": null,
    "message": null
  },
  "status": "200"
}
```

## User Experience Improvements

1. **Simplified Checkout**: Users no longer see payment method selection until they're ready to pay
2. **Clear Payment Options**: Visual cards showing both Mobile Money and Card payment options
3. **Status Feedback**: Real-time feedback for payment processing and status checking
4. **External Payment Window**: Card payments open in separate window for security
5. **Manual Status Check**: Users can manually verify payment completion

## Technical Features

1. **Type Safety**: Full TypeScript integration with proper interfaces
2. **Error Handling**: Comprehensive error handling for both payment methods
3. **State Management**: Proper state management for payment flows
4. **Responsive Design**: Mobile-friendly payment selection interface
5. **Loading States**: Clear loading indicators during payment processing

## Testing Recommendations

1. Test both payment flows end-to-end
2. Verify address and user data is properly passed to Pesapal
3. Test payment status checking functionality
4. Verify order creation upon successful payments
5. Test error scenarios for both payment methods

## Future Enhancements

1. Auto-refresh status checking for Pesapal
2. Webhook integration for real-time payment notifications
3. Payment retry mechanisms
4. Enhanced user notifications and email confirmations
5. Payment analytics and reporting
