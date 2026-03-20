Update the existing “Where Your Money Goes” pricing system with the following logic and constraints:

━━━━━━━━━━━━━━━━━━━━━━━

1. PLATFORM FEE (FIXED)
   ━━━━━━━━━━━━━━━━━━━━━━━

* Set platform fee to a strict fixed value of 10% for all products
* Platform Fee = 10% of product base price (exclude shipping)
* This value must remain constant across all categories and views

Display format:
“Platform Fee (10%): ₹{calculated_amount}”

━━━━━━━━━━━━━━━━━━━━━━━
2. SHIPPING COST (CATEGORY-BASED + DYNAMIC)
━━━━━━━━━━━━━━━━━━━━━━━

Shipping must NOT be a fixed value.

Define base shipping ranges per category:

* Paintings / Wall Art → ₹80–₹120
* Handmade Jewelry → ₹40–₹70
* Clothing / Textiles → ₹60–₹100
* Home Decor / Handicrafts → ₹70–₹130

Then dynamically adjust shipping using:

Final Shipping Cost =
Base Category Cost

* Weight Adjustment
* Distance Adjustment

Where:

* Weight Adjustment increases cost for heavier items
* Distance Adjustment varies based on delivery location (local / regional / national)

Ensure:
Shipping cost updates automatically when user changes location or selects variant.

━━━━━━━━━━━━━━━━━━━━━━━
3. PRICE CALCULATION FORMULA
━━━━━━━━━━━━━━━━━━━━━━━

Base Price = ₹{product_price}

Platform Fee = 10% of Base Price

Shipping = dynamically calculated (category + weight + distance)

Total Payable =
Base Price + Shipping

Artisan Earnings =
Base Price - Platform Fee

━━━━━━━━━━━━━━━━━━━━━━━
4. UI DISPLAY STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━

Display the breakdown clearly:

Product Price: ₹{base_price}
Shipping: ₹{shipping}
Total: ₹{total}

Breakdown Section:

🧑‍🎨 Artisan Earnings: ₹{artisan_amount}
🏪 Platform Fee (10%): ₹{platform_fee}
🚚 Shipping Cost: ₹{shipping}

━━━━━━━━━━━━━━━━━━━━━━━
5. UX RULES
━━━━━━━━━━━━━━━━━━━━━━━

* Always ensure:
  Artisan + Platform Fee = Base Price

* Shipping must be shown separately (never included in platform fee)

* Show real-time updates when:

  * Product variant changes
  * User location changes

━━━━━━━━━━━━━━━━━━━━━━━
6. TRANSPARENCY ENHANCEMENT
━━━━━━━━━━━━━━━━━━━━━━━

Add microcopy:

“10% platform fee helps us operate and support artisans”

“Shipping cost varies based on product type and delivery location”

━━━━━━━━━━━━━━━━━━━━━━━

Final Output:
Update existing UI and logic without changing layout design.
Ensure calculations are accurate, dynamic, and consistent across all pages.
