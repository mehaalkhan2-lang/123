# Security Specification for Achievements Gallery

## Data Invariants
- A gallery image must have a valid URL.
- Only the specific user `mehaalkhan.2@gmail.com` can upload images.
- All users can view images.
- Timestamps must be server-generated.
- Emails must be verified (if login is used).

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to upload as `evil@hacker.com`.
2. **State Shortcutting**: Attempt to set a manual `createdAt` in the past.
3. **Ghost Fields**: Adding `isVerified: true` to the document.
4. **ID Poisoning**: Using a 2MB string as `imageId`.
5. **No Auth**: Attempting to upload without being signed in.
6. **Insecure List**: Attempting to list all images without the right query (if rules were restricted).
7. **PII Leak**: If we stored phone numbers, attempting to read them.
8. **Resource Exhaustion**: Uploading a 1MB string into the `alt` field.
9. **Email Spoofing**: Claiming to be `mehaalkhan.2@gmail.com` without `email_verified == true`.
10. **Shadow Update**: Updating a field that should be immutable (like `uploadedBy`).
11. **Type Poisoning**: Sending an integer for the `url` field.
12. **Orphaned Writes**: Creating an image linked to a non-existent parent (not applicable here as it's a top-level collection).

## The Test Runner
A `firestore.rules.test.ts` would normally go here, but I will implement the rules directly following the principles.
