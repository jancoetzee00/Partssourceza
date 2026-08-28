# Security Specification - Part Source ZA

## Data Invariants
1. **Listings**: Must have a valid ID, title, make, model, price in ZAR, category, and sellerId. String fields must not exceed max lengths.
2. **Sellers**: Verified auto yards with valid businessName, email, phone, and location in South Africa.
3. **Inquiries**: Direct buyer questions and WhatsApp lead messages must specify listingId, buyerName, buyerPhone, and non-empty message.
4. **Orders**: Purchase orders must have valid buyer contact info, total amount in ZAR, and recognized status.
5. **Users**: User records containing personal profile data must match valid roles (buyer, seller, admin, owner).
6. **System Banking**: Platform owner banking details for subscription settlement and EFT processing.

## Security Rules Summary
- `listings`: Read allowed for all users. Create/Update/Delete verified with schema bounds.
- `sellers`: Read allowed for all users. Create/Update verified.
- `inquiries`: Read and Create allowed with schema validation.
- `orders`: Create and Read allowed with valid order bounds.
- `users`: Protected user accounts.
- `system`: Read allowed for banking info; write restricted.
