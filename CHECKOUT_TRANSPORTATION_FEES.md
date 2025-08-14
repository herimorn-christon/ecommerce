# Checkout Transportation Fees Integration

## Overview

Updated the checkout process to include dynamic transportation fees based on the transporter's configured rates, delivery destination, and **transportation type** (standard/express). This ensures accurate pricing for transportation services during the checkout process with delivery type preferences.

## Features Implemented

### 1. **Transportation Type Support**

- **Delivery Options**: Standard and Express transportation types
- **Type-based Pricing**: Different rates for standard vs express delivery
- **Intelligent Matching**: Prioritizes fees matching selected delivery option
- **Fallback Logic**: Uses available options if exact match not found

### 2. **Dynamic Transportation Fee Calculation**

- **Route-based Pricing**: Calculates fees based on transporter's configured routes
- **Destination Matching**: Matches delivery address with transporter's available routes
- **Type-aware Selection**: Considers both destination and transportation type
- **Quantity-based Charges**: Applies transportation fees per item quantity
- **Smart Fallback**: Uses best available option when exact match unavailable

### 3. **Enhanced Order Summary**

- **Fee Breakdown**: Shows detailed transportation fees per item/transporter
- **Type Display**: Shows transportation type (Standard/Express) in breakdown
- **Route Information**: Displays transportation routes (Starting Point → Destination)
- **Transparent Pricing**: Clear separation between base delivery fee and transportation fees
- **Total Calculation**: Includes all fees in the final order total

### 4. **Improved Transporter Selection**

- **Type-aware Fees**: Shows transportation fees matching selected delivery option
- **Type Display**: Indicates transportation type for each fee option
- **Route Preview**: Displays available routes for selected destination
- **Weight Limits**: Shows weight restrictions where applicable
- **Per-item Pricing**: Clear indication of cost per item with type information

## Technical Implementation

### 1. **Type System Updates** (`src/types.ts`)

#### New Transportation Type:

```typescript
export type TransportationType = "standard" | "express";

export interface TransportationFee {
  id?: string;
  startingPoint: string;
  destination: string;
  price: number;
  weight: number; // Weight in kg
  transportationType: TransportationType; // NEW: Type field
  delete?: boolean;
}
```

### 2. **TransporterProfileEditPage Updates** (`src/pages/transporter/TransporterProfileEditPage.tsx`)

#### New Transportation Type Field:

```tsx
// Updated grid layout to 6 columns (was 5)
<div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">

// New Transportation Type selector
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Transportation Type
  </label>
  <select
    value={fee.transportationType}
    onChange={(e) =>
      handleFeeChange(
        index,
        "transportationType",
        e.target.value as 'standard' | 'express'
      )
    }
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
    disabled={fee.delete}
  >
    <option value="standard">Standard</option>
    <option value="express">Express</option>
  </select>
</div>
```

#### Updated Initialization:

```typescript
// Initialize new fees with transportation type
setTransportationFees([
  {
    startingPoint: "",
    destination: "",
    price: 0,
    weight: 0,
    transportationType: "standard", // NEW: Default type
  },
]);
```

### 3. **CheckoutForm Updates** (`src/components/checkout/CheckoutForm.tsx`)

#### Enhanced Fee Calculation Logic:

```typescript
// Updated calculateTransportationFees function
const calculateTransportationFees = () => {
  // ... existing code ...

  // Try to find a fee that matches both destination and transportation type
  let applicableFee = transporter.transportationFees.find(
    (fee) =>
      (fee.destination.toLowerCase() === destinationCity.toLowerCase() ||
        fee.destination.toLowerCase() ===
          selectedAddress.region.toLowerCase()) &&
      fee.transportationType === deliveryOption // NEW: Type matching
  );

  // If no exact match found, try to find by destination only
  if (!applicableFee) {
    applicableFee = transporter.transportationFees.find(
      (fee) =>
        fee.destination.toLowerCase() === destinationCity.toLowerCase() ||
        fee.destination.toLowerCase() === selectedAddress.region.toLowerCase()
    );
  }

  // Fallback to first available fee
  if (!applicableFee && transporter.transportationFees.length > 0) {
    applicableFee = transporter.transportationFees[0];
  }
};
```

#### Enhanced Fee Breakdown:

```typescript
// Updated breakdown type to include transportation type
const breakdown: Array<{
  itemName: string;
  transporterName: string;
  route: string;
  transportationType: string; // NEW: Type display
  quantity: number;
  feePerUnit: number;
  totalFee: number;
}> = [];

// Updated breakdown creation
breakdown.push({
  itemName: item.product.name,
  transporterName: transporter.businessName,
  route: `${applicableFee.startingPoint} → ${applicableFee.destination}`,
  transportationType:
    applicableFee.transportationType.charAt(0).toUpperCase() +
    applicableFee.transportationType.slice(1), // NEW: Formatted type
  quantity: item.quantity,
  feePerUnit: applicableFee.price,
  totalFee: applicableFee.price * item.quantity,
});
```

#### Updated UI Display:

```jsx
{
  /* Enhanced breakdown display with transportation type */
}
<div className="flex justify-between text-sm text-gray-500">
  <div>
    <span className="block">{fee.itemName}</span>
    <span className="text-xs">
      {fee.route} via {fee.transporterName} ({fee.transportationType})
    </span>
  </div>
  <span>
    {fee.quantity} × TZS {fee.feePerUnit.toLocaleString()} = TZS{" "}
    {fee.totalFee.toLocaleString()}
  </span>
</div>;
```

### 4. **TransporterSelect Component** (`src/components/checkout/TransporterSelect.tsx`)

#### Enhanced Props:

```typescript
interface TransporterSelectProps {
  // ... existing props ...
  deliveryOption?: "standard" | "express"; // NEW: Delivery option prop
}
```

#### Type-aware Fee Selection:

```typescript
const getApplicableFee = (transporter: Transporter) => {
  if (!transporter.transportationFees || !destinationCity) return null;

  // Try to find a fee that matches both destination and transportation type
  let applicableFee = transporter.transportationFees.find(
    (fee) =>
      (fee.destination.toLowerCase() === destinationCity.toLowerCase() ||
        (destinationRegion &&
          fee.destination.toLowerCase() === destinationRegion.toLowerCase())) &&
      fee.transportationType === deliveryOption // NEW: Type consideration
  );

  // Fallback logic for partial matches
  if (!applicableFee) {
    applicableFee = transporter.transportationFees.find(
      (fee) =>
        fee.destination.toLowerCase() === destinationCity.toLowerCase() ||
        (destinationRegion &&
          fee.destination.toLowerCase() === destinationRegion.toLowerCase())
    );
  }

  // Final fallback
  if (!applicableFee && transporter.transportationFees.length > 0) {
    applicableFee = transporter.transportationFees[0];
  }

  return applicableFee;
};
```

#### Enhanced Display:

```jsx
{
  applicableFee && (
    <div className="mt-1">
      <p className="text-xs text-green-600 font-medium">
        {applicableFee.startingPoint} → {applicableFee.destination}
      </p>
      <p className="text-xs text-gray-600">
        TZS {applicableFee.price.toLocaleString()} per item (
        {applicableFee.transportationType})
        {applicableFee.weight > 0 && ` (${applicableFee.weight}kg limit)`}
      </p>
    </div>
  );
}
```

## User Experience Flow

### 1. **Address Selection**

- User selects or creates delivery address
- System identifies destination city and region

### 2. **Delivery Type Selection**

- User chooses between Standard or Express delivery
- System updates available transportation options based on selection

### 3. **Transporter Selection**

- Available transporters displayed with type-appropriate fees
- Transportation type and route information shown for each option
- Express options highlighted when express delivery selected

### 4. **Order Summary**

- Itemized breakdown of all charges:
  - Product subtotal
  - Base delivery fee (standard/express)
  - Transportation fees (per item/transporter with type)
  - Final total

### 5. **Payment Confirmation**

- Complete fee breakdown included in payment summary
- Transportation types clearly indicated
- All fees included in final payment amount

## Example Scenarios

### Scenario 1: Standard Delivery with Type Match

```
Product: Fresh Fish (Qty: 2) - TZS 50,000
Delivery Option: Standard
Transporter: Ocean Logistics
Route: Dar es Salaam → Kigoma (Standard)
Transportation Fee: TZS 15,000 per item

Breakdown:
- Subtotal: TZS 100,000
- Base Delivery (Standard): TZS 5,000
- Transportation (Standard): 2 × TZS 15,000 = TZS 30,000
- Total: TZS 135,000
```

### Scenario 2: Express Delivery with Type Matching

```
Product: Seafood (Qty: 1) - TZS 75,000
Delivery Option: Express
Transporter: Fast Delivery
Route: Dar es Salaam → Kigoma (Express)
Transportation Fee: TZS 25,000 per item

Breakdown:
- Subtotal: TZS 75,000
- Base Delivery (Express): TZS 10,000
- Transportation (Express): 1 × TZS 25,000 = TZS 25,000
- Total: TZS 110,000
```

### Scenario 3: Mixed Types with Fallback

```
Product: Fish (Qty: 1) - TZS 50,000
Delivery Option: Express
Transporter: Basic Transport (only has Standard rates)
Route: Dar es Salaam → Kigoma (Standard - fallback)
Transportation Fee: TZS 15,000 per item

Breakdown:
- Subtotal: TZS 50,000
- Base Delivery (Express): TZS 10,000
- Transportation (Standard - fallback): TZS 15,000
- Total: TZS 75,000

Note: System uses available standard rate when express not available
```

## Pricing Logic

### 1. **Fee Matching Algorithm**

```typescript
// Priority order for fee matching:
1. Exact match: destination + transportation type
2. Destination match: destination only (any type)
3. Fallback: First available route regardless of type
```

### 2. **Transportation Type Handling**

- **Preferred Match**: Fees matching selected delivery option (standard/express)
- **Fallback Logic**: Uses available fees if exact type match not found
- **Type Display**: Shows actual transportation type in breakdown
- **Pricing Transparency**: Clear indication when fallback occurs

### 3. **Fee Application**

- **Per Item Basis**: Transportation fee × item quantity
- **Type Consideration**: Different prices for standard vs express
- **Route Specific**: Different fees for different routes and types

### 4. **Total Calculation**

```typescript
finalTotal = itemsSubtotal + baseDeliveryFee + transportationFees;
// Where baseDeliveryFee and transportationFees can vary by type
```

## Configuration Requirements

### 1. **Transporter Setup**

Transporters must configure transportation fees with:

- Starting point (select: Dar es Salaam, Kigoma)
- Destination (select: Dar es Salaam, Kigoma)
- **Transportation Type** (select: Standard, Express) - **NEW**
- Price per item (TZS)
- Weight limit (kg) - optional

#### Example Transportation Fee Configuration:

```
Route 1:
- Starting Point: Dar es Salaam
- Destination: Kigoma
- Type: Standard
- Price: TZS 15,000 per item
- Weight: 10kg limit

Route 2:
- Starting Point: Dar es Salaam
- Destination: Kigoma
- Type: Express
- Price: TZS 25,000 per item
- Weight: 5kg limit
```

### 2. **Address Requirements**

Customer addresses must include:

- City (for route matching)
- Region (for fallback matching)
- Complete address details

### 3. **Delivery Option Integration**

The system integrates with existing delivery option selection:

- **Standard Delivery**: Matches standard transportation fees
- **Express Delivery**: Matches express transportation fees
- **Fallback Behavior**: Uses available options when exact match not found

## Benefits

### 1. **For Customers**

- **Type-based Options**: Choose between standard and express transportation
- **Transparent Pricing**: Clear breakdown of all fees with type information
- **Accurate Totals**: No surprise charges at checkout
- **Delivery Flexibility**: Options for different urgency levels

### 2. **For Transporters**

- **Flexible Pricing**: Set different rates for standard vs express
- **Service Differentiation**: Offer multiple service levels
- **Business Control**: Competitive pricing per service type
- **Revenue Optimization**: Premium pricing for express services

### 3. **For Platform**

- **Enhanced Matching**: Intelligent fee selection based on customer preference
- **Service Variety**: Support for multiple delivery service levels
- **Automated Billing**: No manual fee calculation required
- **Scalable System**: Easy to add new service types and routes

## Future Enhancements

### 1. **Additional Service Types**

- **Priority Express**: Same-day delivery option
- **Economy Standard**: Budget-friendly slower option
- **Scheduled Delivery**: Specific time slot deliveries

### 2. **Time-based Pricing**

- **Peak Hour Surcharges**: Higher rates during busy periods
- **Off-peak Discounts**: Lower rates during quiet times
- **Seasonal Adjustments**: Holiday and event-based pricing

### 3. **Service Level Features**

- **Express Guarantees**: Money-back for late express deliveries
- **Tracking Integration**: Real-time tracking for express shipments
- **Insurance Options**: Enhanced coverage for express deliveries

### 4. **Weight-based Pricing**

- **Tiered Weight Pricing**: Different rates for weight ranges
- **Type-specific Limits**: Different weight limits per service type
- **Volume Discounts**: Bulk shipping optimization

## Testing Considerations

### 1. **Transportation Type Tests**

- Verify correct fee matching by type and destination
- Test fallback logic when preferred type unavailable
- Validate type display in UI components

### 2. **Fee Calculation Tests**

- Test mixed transportation types in same order
- Verify correct total calculation with type considerations
- Test edge cases with missing or incomplete fee configurations

### 3. **UI/UX Tests**

- Ensure transportation type is clearly displayed
- Test responsive design with additional type information
- Verify transporter selection shows correct type-based fees

### 4. **Integration Tests**

- Test with various delivery option selections
- Verify payment integration includes type-aware fees
- Test order creation with transportation type information

## Deployment Notes

- **Backward Compatibility**: System gracefully handles existing fees without transportation type (defaults to 'standard')
- **Migration Strategy**: Existing transportation fees automatically assigned 'standard' type
- **Error Handling**: Fallback to available options when type matching fails
- **Performance**: Efficient type-aware matching with minimal overhead

## Migration Guide

### For Existing Data:

1. **Automatic Type Assignment**: All existing transportation fees will be assigned `transportationType: 'standard'`
2. **Optional Express Setup**: Transporters can add express options through profile edit
3. **Gradual Rollout**: System works with partial type coverage during transition

### For New Transporters:

1. **Required Field**: Transportation type is now required for all new fee configurations
2. **Default Value**: New fees default to 'standard' type
3. **Best Practices**: Recommend setting up both standard and express options for full coverage

The transportation type integration is now complete and provides comprehensive support for different delivery service levels with intelligent matching and transparent pricing!
