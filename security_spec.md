# StudyFlow Security Specification (Phase 0)

## 1. Data Invariants
1. **Owner-Only Access**: A user can only read, create, update, or delete documents under `/users/{userId}` where `request.auth.uid == userId` and `request.auth.token.email_verified == true`.
2. **PII Isolation**: Email addresses (`email`, `parentEmail`) and phone numbers (`parentWhatsapp`) are strictly segregated into `/users/{userId}/private/info` and are never readable by other users or unauthenticated callers.
3. **Strict Schema Enforcement**: Every write checks exact required & allowed keys (`hasAll` + `hasOnly`), field types, string `.size()` bounds, integer range checks, and regex ID validation (`^[a-zA-Z0-9_\\-]+$`).
4. **Immutable Ownership & Timestamps**: `uid` and `createdAt` cannot be modified after creation, and server timestamps (`request.time`) are enforced on `createdAt` / `updatedAt` / `sentAt`.
5. **Payment & Report Integrity**: Payment records require `status == 'verified'`, valid `planTier` (`'plus'` or `'pro_ultra'`), positive `amountInr`, valid `upiPayee`, and valid `utrNumber`. Parent report logs enforce `completionRate` within `0..100` and valid `channel` (`'gmail'` or `'whatsapp'`).

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Read/Write**: Unauthenticated user reads `/users/user123` -> DENIED.
2. **Cross-User Profile Read**: Signed-in `userA` attempts to `get` `/users/userB` -> DENIED.
3. **Cross-User PII Leak**: Signed-in `userA` attempts to `get` `/users/userB/private/info` -> DENIED.
4. **Unverified Email Spoof**: Signed-in user with `email_verified: false` writes to `/users/userA` -> DENIED.
5. **Identity Spoofing on Create**: `userA` writes `/users/userA` with `{ uid: "userB", ... }` -> DENIED.
6. **Shadow Ghost Field Injection**: `userA` creates `/users/userA` with extra `{ isAdmin: true }` -> DENIED.
7. **ID Poisoning**: `userA` creates `/users/userA/payments/bad$id!` with invalid document ID -> DENIED.
8. **Resource Exhaustion (1MB String)**: `userA` writes `username` of length 2000 chars -> DENIED.
9. **Client Timestamp Forgery**: `userA` passes past `createdAt` instead of `request.time` -> DENIED.
10. **Immutable Field Mutation**: `userA` updates `/users/userA` changing `createdAt` or `uid` -> DENIED.
11. **Invalid Payment Amount / Tier**: `userA` creates `/users/userA/payments/p1` with `amountInr: -100` or `planTier: "enterprise"` -> DENIED.
12. **Blanket List Scraping**: `userA` runs `list` on `/users/userB/payments` -> DENIED.
