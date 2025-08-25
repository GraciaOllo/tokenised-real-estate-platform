# Tenant Modal Fix - TODO List

## Steps to Complete:

1. [ ] Update AddTenantModal.tsx to fetch users for dropdown
2. [ ] Add user selection dropdown with email display
3. [ ] Convert form submission from FormData to JSON format
4. [ ] Convert date strings to Date objects
5. [ ] Rename securityDeposit to depositAmount
6. [ ] Remove unnecessary fields (firstName, lastName, email, phone) since we're selecting existing users
7. [ ] Update validation schema accordingly
8. [ ] Test the functionality

## Current Issues to Fix:
- userId must be a string (will be selected from dropdown)
- leaseStartDate must be a Date instance (convert from string)
- leaseEndDate must be a Date instance (convert from string)
- monthlyRent must be a number (already handled with valueAsNumber)
- depositAmount must be a number (rename from securityDeposit and convert)

## Expected Flow:
1. Property owner opens Add Tenant modal
2. Selects an existing user from dropdown (by email)
3. Fills in lease details and financial information
4. Submits form as JSON with proper types
5. Backend validation passes successfully
