# Security Specification - LoanDealer

## Data Invariants
1. A loan record MUST have a `userId` matching the creator's UID.
2. A loan amount MUST be a positive number.
3. Status transitions should strictly follow business logic (Pending -> Returned).
4. Users cannot modify another user's profile or loans.

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Identity Theft**: Creating a loan with `userId: "NOT_ME"`.
2. **Resource Poisoning**: Creating a loan with an ID that is 2MB long.
3. **Invalid Type**: Setting `amount: "a million dollars"`.
4. **State Injection**: Updating a `returned` loan back to `pending` without authorization (if logic forbids it).
5. **PII Exposure**: Trying to read `/users/SOME_OTHER_UID`.
6. **Shadow Fields**: Adding `isAdmin: true` to a user profile.
7. **Negative Money**: Setting `amount: -100`.
8. **Malformed ID**: Creating a loan with ID `@#$%^`.
9. **Query Scrape**: Listing all loans without a `where` filter on `userId`.
10. **Immutability Breach**: Updating `createdAt` on an existing loan.
11. **Spoofed Name**: Injecting a 5000 character string into `personName`.
12. **Status Bypass**: Directly deleting a loan that should only be marked as `returned` (if deletion is restricted).

## Firestore Security Rules Draft
(Rules will be implemented in firestore.rules)
