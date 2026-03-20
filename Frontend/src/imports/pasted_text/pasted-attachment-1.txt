Build a fully functional routing system for an eCommerce website (KalaKart), where all already-built UI sections (hero slider, categories, featured products, artisans) are correctly connected through dynamic navigation.

The routing must ensure:

Correct page navigation

Correct data rendering based on URL

No duplication of pages

No incorrect or mixed data

🧭 1. REQUIRED ROUTING STRUCTURE

Implement the following routes using dynamic routing:

/                       → Homepage  
/artisans               → All artisans listing page  
/artisan/:artisanId     → Individual artisan store page  
/category/:categoryName → Dynamic category page  
🔗 2. ROUTING INTEGRATION WITH EXISTING UI
🔶 HERO SLIDER (PREMIUM SELLERS)
Existing:

Slider already displays premium artisans

Add Routing Behavior:

Each slider item must contain:

artisanId

On Click:

Redirect user to:

/artisan/:artisanId
Strict Rule:

Navigation must be dynamic

Each click must open the correct artisan

No static linking

🧑‍🎨 ARTISAN STORE PAGE ROUTING
Route:
/artisan/:artisanId
Behavior:

Extract artisanId from URL

Load:

Artisan details

Products belonging ONLY to that artisan

Constraint:

Must NOT display products from other artisans

Must reuse the same page for all artisans

🗂️ CATEGORY SECTION (HOMEPAGE)
Existing:

Categories are already displayed as clickable elements

Add Routing Behavior:

Each category must carry:

categoryName or categoryId

On Click:
/category/:categoryName
🪄 CATEGORY PAGE (SINGLE REUSABLE PAGE)
Route:
/category/:categoryName
Core Requirement:

This is ONE single page reused for all categories

Behavior:

Read categoryName from URL

Dynamically update product list

Critical Rules:

Show ONLY selected category products

Replace content when URL changes

No multiple category pages

No mixed data

⭐ FEATURED PRODUCTS SECTION
Existing:

Categories with preview products + "View All"

Add Routing Behavior:
On "View All" Click:
/category/:categoryName
Strict Rules:

Must redirect to correct category page

Must NOT show products from other categories

Must behave exactly same as category click

👥 "MEET OUR ARTISANS" SECTION
Existing:

Section exists on homepage

On Click:
/artisans
🧑‍🎨 ARTISANS LIST PAGE
Route:
/artisans
Behavior:

Display all artisans

On Clicking Any Artisan:
/artisan/:artisanId
Constraint:

Must reuse artisan page

Must pass correct ID

⚙️ 3. ROUTING IMPLEMENTATION RULES
✅ MUST IMPLEMENT

Use dynamic routing system (React Router / Next.js)

Use URL parameters:

artisanId

categoryName

Navigation must be consistent from all entry points:

Hero slider

Categories

Featured "View All"

Artisan list

❌ MUST AVOID

Hardcoded navigation paths

Creating separate pages for each category

Creating separate pages for each artisan

Passing data manually instead of using URL

Rendering incorrect or mixed data

🧠 4. STATE & RE-RENDERING BEHAVIOR

Page must re-render when URL param changes

No manual refresh required

Routing must control content

🚨 5. FAILURE CONDITIONS (MUST NOT HAPPEN)

The system is incorrect if:

Clicking a category shows mixed products

Clicking hero slider opens wrong artisan

"View All" shows incorrect category

Multiple pages exist for categories

Artisan data mismatches with URL

🧩 6. FINAL EXPECTED RESULT

Smooth navigation across entire website

URL always reflects current page

Content always matches URL

Single reusable pages for:

Categories

Artisans

⚠️ FINAL REALITY CHECK

If this prompt is followed properly:
→ Your site becomes scalable

If not:
→ You’ll end up with:

broken navigation

duplicate pages

inconsistent data