# Transporter Pr### Transportation Fees Management

- Add multiple transportation routes with pricing
- **Weight-based pricing** for different cargo weights
- Edit existing transportation fees
- Delete transportation fees (with soft deletion for existing fees)
- Visual feedback for fees marked for deletion
- Validation for required fieldspdate Implementation

## Overview

Implemented a comprehensive transporter profile update system that allows transporters to update their business information and manage transportation fees through the endpoint `PUT /v1/transporters/me`.

## Features Implemented

### 1. **Business Information Update**

- Business Name
- Business Address
- Location (Country, Region, District)
- Business Description
- License Image URL

### 2. **Transportation Fees Management**

- Add multiple transportation routes with pricing
- Edit existing transportation fees
- Delete transportation fees (with soft deletion for existing fees)
- Visual feedback for fees marked for deletion
- Validation for required fields

### 3. **User Experience Enhancements**

- Real-time form validation
- Loading states during submission
- Success/error notifications using toast messages
- Responsive design for mobile and desktop
- Professional UI with clear visual hierarchy

## Technical Implementation

### 1. **Type Definitions** (`src/types.ts`)

```typescript
// Transportation Fee interface
export interface TransportationFee {
  id?: string;
  startingPoint: string;
  destination: string;
  price: number;
  weight: number; // Weight in kg
  delete?: boolean;
}

// Updated Transporter interface
export interface Transporter {
  // ... existing fields
  transportationFees?: TransportationFee[];
}

// Transporter update request interface
export interface TransporterUpdateRequest {
  businessName?: string;
  licenseImage?: string;
  address?: string;
  country?: string;
  region?: string;
  district?: string;
  description?: string;
  transportationFees?: TransportationFee[];
}
```

### 2. **Service Layer** (`src/services/transporterService.ts`)

```typescript
// Update transporter profile method
updateTransporterProfile: async (
  updateData: TransporterUpdateRequest
): Promise<Transporter> => {
  try {
    const response = await api.put("/v1/transporters/me", updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating transporter profile:", error);
    throw error;
  }
};
```

### 3. **Redux State Management** (`src/redux/slices/transporterSlice.ts`)

```typescript
// Async thunk for updating profile
export const updateTransporterProfile = createAsyncThunk(
  "transporters/updateProfile",
  async (updateData: TransporterUpdateRequest, { rejectWithValue }) => {
    try {
      const transporter = await transporterService.updateTransporterProfile(
        updateData
      );
      return transporter;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update transporter profile"
      );
    }
  }
);
```

### 4. **UI Component** (`src/pages/transporter/TransporterProfileEditPage.tsx`)

#### Key Features:

- **Form State Management**: Separate state for business info and transportation fees
- **Dynamic Fee Management**: Add/remove transportation routes dynamically
- **Soft Deletion**: Existing fees are marked for deletion rather than immediately removed
- **Validation**: Client-side validation for required fields
- **Loading States**: Proper loading indicators during API calls
- **Error Handling**: Comprehensive error handling with user-friendly messages

#### Transportation Fees Management:

- **Add Route**: Users can add new transportation routes
- **Edit Route**: Inline editing of existing routes
- **Remove Route**: Delete routes with visual feedback
- **Validation**: Ensures all required fields are filled before submission

## API Request/Response Format

### Request Body Example:

```json
{
  "businessName": "Fast Delivery Services",
  "licenseImage": "uploads/licenses/license-image-123.jpg",
  "address": "123 Delivery Street",
  "country": "Tanzania",
  "region": "Dar es Salaam",
  "district": "Kinondoni",
  "description": "Specializing in refrigerated goods transportation across Tanzania",
  "transportationFees": [
    {
      "id": "clfg7c1w20000jz08t4zx3e9q",
      "startingPoint": "Dar es Salaam",
      "destination": "Arusha",
      "price": 50000,
      "delete": false
    },
    {
      "startingPoint": "Dodoma",
      "destination": "Mwanza",
      "price": 75000
    },
    {
      "id": "existing_fee_id",
      "delete": true
    }
  ]
}
```

### Response Format:

Returns the updated `Transporter` object with all fields including the updated transportation fees.

## User Flow

1. **Navigate to Edit Profile**: Transporter clicks "Edit Profile" button
2. **Load Current Data**: Form auto-populates with existing transporter information
3. **Edit Business Info**: Update basic business information fields
4. **Manage Transportation Fees**:
   - View existing routes
   - Add new routes using "Add Route" button
   - Edit existing routes inline
   - Delete routes (marked for deletion)
5. **Submit Changes**: Click "Save Changes" to update profile
6. **Confirmation**: Success toast and redirect to profile page

## Validation Rules

### Business Information:

- Business Name: Required
- Address: Optional but recommended
- Location fields: Optional
- Description: Optional
- License Image: Optional

### Transportation Fees:

- Starting Point: Required if route is not being deleted
- Destination: Required if route is not being deleted
- Price: Must be greater than 0 if route is not being deleted

## Error Handling

1. **Network Errors**: Toast notification with retry option
2. **Validation Errors**: Inline field validation
3. **Server Errors**: Display server error messages
4. **Loading States**: Prevent multiple submissions

## Security Considerations

1. **Authentication**: Only authenticated transporters can update their profile
2. **Authorization**: Users can only update their own profile
3. **Input Validation**: Both client-side and server-side validation
4. **Data Sanitization**: Proper handling of user input

## Future Enhancements

1. **File Upload**: Direct license image upload instead of URL
2. **Route Validation**: Validate that starting point and destination are different
3. **Bulk Operations**: Import/export transportation fees from CSV
4. **Auto-save**: Save draft changes automatically
5. **History**: Track profile change history
6. **Advanced Validation**: Geographic validation of routes

## Testing Recommendations

1. **Unit Tests**: Test transportation fee management functions
2. **Integration Tests**: Test API integration and Redux flow
3. **E2E Tests**: Complete user flow from login to profile update
4. **Validation Tests**: Test all validation scenarios
5. **Error Handling Tests**: Test error scenarios and recovery

## Files Modified

1. `src/types.ts` - Added transportation fee and update request types
2. `src/services/transporterService.ts` - Added update profile service method
3. `src/redux/slices/transporterSlice.ts` - Added update profile async thunk and reducers
4. `src/pages/transporter/TransporterProfileEditPage.tsx` - Complete UI implementation

## Dependencies

- `react-hot-toast` - For user notifications
- `lucide-react` - For icons (Plus, Trash2, Save, X)
- Existing Redux Toolkit setup
- Existing component library (Button component)

The implementation is production-ready with comprehensive error handling, user-friendly interfaces, and follows React and Redux best practices.
