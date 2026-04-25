# Security Specification for TrailMaster

## Data Invariants
1. **User Identity:** `users/{userId}`: `userId` must equal `request.auth.uid`.
2. **Result Ownership:** `test_results/{resultId}`: `userId` field must match `request.auth.uid`.
3. **Training Integrity:** `test_results.duration` must be a positive number; `errors` must be a non-negative integer.
4. **AI Feedback:** `ai_feedback/{feedbackId}`: `userId` field must match `request.auth.uid`. Only read access allowed for users.

## The Dirty Dozen (Test Cases)
1. **Identity Spoofing:** Creating a user profile for a different UID.
2. **Result Hijacking:** Reading another user's `test_results`.
3. **Data Pollution:** Submitting a result with negative duration.
4. **Malicious Injection:** ID string with > 1MB of content.
5. **Unauthorized Feedback:** Attempting to write to the `ai_feedback` collection as a standard user.
6. **Bypassing Verification:** Writing content without `email_verified == true`.
7. **Schema Gap:** Updating `test_results` to include an unauthorized administrative flag.
8. **Orphaned Writes:** Creating a `test_result` for a non-existent user.
9. **Timestamp Fraud:** Setting `timestamp` to a future date manually.
10. **Query Scraping:** Listing all `test_results` without a `userId` filter.
11. **Type Poisoning:** Setting `duration` to a boolean instead of a number.
12. **Status Shortcutting:** Modifying a terminal result's duration after it's been recorded.

## Rule Validation Script Draft
```typescript
// firestore.rules.test.ts (logic check)
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

// ... Logic to test the Dirty Dozen ...
```
