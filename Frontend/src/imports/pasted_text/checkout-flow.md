Design and implement a **Cart → Authentication → Checkout Flow** with proper user-state handling and data persistence.

━━━━━━━━━━━━━━━━━━━━━━━

1. USER STATES (MANDATORY LOGIC)
   ━━━━━━━━━━━━━━━━━━━━━━━

Define two user states:

A. Guest User (Not Logged In)
B. Authenticated User (Logged In)

System must detect user state at every step.

━━━━━━━━━━━━━━━━━━━━━━━
2. ADD TO CART BEHAVIOR
━━━━━━━━━━━━━━━━━━━━━━━

When user clicks “Add to Cart”:

* Product must be added to cart regardless of login state
* Store cart data:

  * Guest → local storage/session
  * Logged-in → database (user cart)

Show confirmation:
“Item added to cart”

━━━━━━━━━━━━━━━━━━━━━━━
3. PROCEED TO CHECKOUT (CRITICAL STEP)
━━━━━━━━━━━━━━━━━━━━━━━

When user clicks “Proceed to Checkout”:

IF user is NOT logged in:
→ Show authentication modal (do NOT redirect immediately)

IF user IS logged in:
→ Directly open Checkout Page

━━━━━━━━━━━━━━━━━━━━━━━
4. AUTHENTICATION MODAL (FOR GUEST USERS)
━━━━━━━━━━━━━━━━━━━━━━━

Modal Title:
“Login to Continue”

Include:

* Email input
* Password input
* Login button
* Secondary option:
  “New user? Create an account”

Actions:

* Login → authenticate user
* Sign Up → create account

IMPORTANT:

* Do NOT clear cart data
* After successful login/signup:
  → Merge guest cart with user cart
  → Redirect to Checkout Page

━━━━━━━━━━━━━━━━━━━━━━━
5. CHECKOUT PAGE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━

A. CART SUMMARY SECTION

* List all selected products:

  * Image
  * Name
  * Quantity
  * Price
* Show pricing breakdown:

  * Product total
  * Shipping cost
  * Final total

━━━━━━━━━━━━━━━━━━━━━━━
B. DELIVERY ADDRESS SECTION
━━━━━━━━━━━━━━━━━━━━━━━

IF user has saved address:
→ Auto-fill and display selected address

IF no address exists:
→ Show address form with fields:

* Full Name
* Phone Number
* Address Line
* City
* State
* Pincode

Include checkbox:
[ ] Save this address for future use

After saving:
→ Store address in user profile database

━━━━━━━━━━━━━━━━━━━━━━━
C. PAYMENT SECTION
━━━━━━━━━━━━━━━━━━━━━━━

Display payment options:

* UPI
* Credit/Debit Card
* Cash on Delivery (optional)

Show final payable amount clearly before payment.

━━━━━━━━━━━━━━━━━━━━━━━
6. UX FLOW (STEP INDICATOR)
━━━━━━━━━━━━━━━━━━━━━━━

Display progress:

Cart → Login → Address → Payment

Highlight current step dynamically.

━━━━━━━━━━━━━━━━━━━━━━━
7. DATA HANDLING RULES
━━━━━━━━━━━━━━━━━━━━━━━

* Cart must persist across login/signup
* No product data loss during authentication
* Address must be reusable once saved
* Prevent duplicate cart items during merge

━━━━━━━━━━━━━━━━━━━━━━━
8. ERROR & EDGE CASE HANDLING
━━━━━━━━━━━━━━━━━━━━━━━

* Invalid login → show inline error
* Empty cart → block checkout
* Missing address → prevent payment until filled
* Network failure → retry option

━━━━━━━━━━━━━━━━━━━━━━━
9. PERFORMANCE & UX RULES
━━━━━━━━━━━━━━━━━━━━━━━

* Use modal for login (avoid full page reload)
* Smooth transition from login → checkout
* Autofocus email field in modal
* Mobile-first responsive design

━━━━━━━━━━━━━━━━━━━━━━━

Final Goal:
Create a seamless checkout experience where users can add to cart freely, are prompted to authenticate only when necessary, and can complete purchase without losing data or facing friction.
