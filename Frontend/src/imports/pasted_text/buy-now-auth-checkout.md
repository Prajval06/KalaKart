Design and implement a **Buy Now → Authentication → Checkout Flow** for an e-commerce platform with clear user-state handling.

━━━━━━━━━━━━━━━━━━━━━━━

1. USER STATE LOGIC (CORE)
   ━━━━━━━━━━━━━━━━━━━━━━━

There are only two valid user states:

A. Guest User (Not Logged In)
B. Authenticated User (Logged In)

System must detect user state before proceeding.

━━━━━━━━━━━━━━━━━━━━━━━
2. BUY NOW BUTTON BEHAVIOR
━━━━━━━━━━━━━━━━━━━━━━━

When user clicks “Buy Now”:

IF user is NOT logged in:
→ Trigger authentication modal (do NOT redirect immediately)

IF user IS logged in:
→ Directly proceed to Checkout Page

━━━━━━━━━━━━━━━━━━━━━━━
3. AUTHENTICATION MODAL (POPUP)
━━━━━━━━━━━━━━━━━━━━━━━

Design a centered modal with:

Title:
“Continue to Checkout”

Options:

* Login (for existing users)
* Sign Up (for new users)

UI Elements:

* Email input
* Password input
* “Continue” button
* Toggle text:
  “New here? Create an account”
  “Already have an account? Login”

UX Rules:

* Keep modal lightweight (no full page redirect initially)
* Allow closing modal (user can continue browsing)

━━━━━━━━━━━━━━━━━━━━━━━
4. POST-AUTH FLOW
━━━━━━━━━━━━━━━━━━━━━━━

After successful login/signup:

→ Automatically redirect user to Checkout Page
→ Preserve selected product (do NOT lose state)

IMPORTANT:
Store product data temporarily (cart/session/local storage)

━━━━━━━━━━━━━━━━━━━━━━━
5. CHECKOUT PAGE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━

Display the following:

A. Product Summary

* Product image
* Product name
* Price breakdown:

  * Product Price
  * Shipping
  * Total

B. Delivery Address Section

* If saved address exists → auto-fill
* Else → show form:

  * Name
  * Phone
  * Address
  * Pincode

C. Payment Section

* UPI
* Card
* COD (optional)

━━━━━━━━━━━━━━━━━━━━━━━
6. UX ENHANCEMENTS
━━━━━━━━━━━━━━━━━━━━━━━

* Show progress indicator:
  Cart → Login → Address → Payment

* Add message:
  “Login required to securely place your order”

* Autofocus email field in modal

━━━━━━━━━━━━━━━━━━━━━━━
7. ERROR HANDLING
━━━━━━━━━━━━━━━━━━━━━━━

* Invalid login → show inline error
* Network issue → retry option
* Do not clear product selection on failure

━━━━━━━━━━━━━━━━━━━━━━━
8. PERFORMANCE RULE
━━━━━━━━━━━━━━━━━━━━━━━

* Authentication must not reload full page
* Use smooth transitions (modal → checkout)

━━━━━━━━━━━━━━━━━━━━━━━

Final Goal:
Create a seamless, fast, and interruption-free buying experience where authentication is required but does not frustrate the user.
