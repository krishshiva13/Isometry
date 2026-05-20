# FActHub Security Specification

## Data Invariants
1. Facts must belong to a valid category.
2. Subscribers must have a valid email format.
3. Only admins can create/update/delete facts, birthdays, and quiz questions.
4. Anyone can subscribe or send a contact message, but nobody can read them except admins.

## The Dirty Dozen Payloads
(Payloads that should be REJECTED)
1. Someone else trying to delete a fact.
2. A user trying to set themselves as an admin.
3. A subscriber entry without an email.
4. A fact with a 1MB string in the title.
5. Updating a fact's `createdAt` timestamp.
6. A contact message without a subject.
7. An anonymous user trying to list all contact messages.
8. A user trying to update a subscriber's email.
9. A fact with an invalid category.
10. A quiz question with only 2 options (must be 4).
11. Injecting a "ghost field" `isVerified: true` into a fact.
12. A document ID with special characters like `/` or `$`.

## The Test Runner
(See `firestore.rules.test.ts` for implementation)
