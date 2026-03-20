Redesign the KalaKart website UI to include a clear, consistent multi-level navigation system that allows users to:

Go back step-by-step through their journey

Visually understand their current position

Navigate to any previous level easily

📐 1. GLOBAL NAVIGATION STRUCTURE (APPLY TO ALL SCREENS)

Design a top navigation section that includes:

A. Back Button (Primary Action)

Position: Top-left corner

Style:

Minimal left arrow icon (←)

Optional label: “Back”

Size: Medium (clearly tappable on mobile)

Behavior (for prototype):

On click → navigate to previous frame

Maintain logical step-by-step flow (not random linking)

B. Breadcrumb Navigation (Secondary but critical)

Place directly below header.

Format:

Home > Category > Subcategory > Product > Details

Design rules:

Horizontal layout

Use > separator

Each level:

Clickable (except current page)

Current page:

Highlighted (bold or different color)

🎨 2. VISUAL DESIGN GUIDELINES
Back Button Styling

Clean, minimal, modern

Slight hover/tap effect

Rounded clickable area

Keep consistent across all pages

Breadcrumb Styling

Font: clean and readable

Size: smaller than page title but clearly visible

Colors:

Previous levels → muted color

Current page → strong highlight (brand color)

Add subtle spacing between elements

📱 3. RESPONSIVE DESIGN (IMPORTANT)
Desktop

Full breadcrumb visible

Mobile

Show:

← Back     Current Page Name

Optional:

Collapse breadcrumb into:

Home > ... > Current
🔁 4. PAGE FLOW STRUCTURE (DEFINE IN FIGMA PROTOTYPE)

Create proper navigation flow like:

Home 
→ Category Page 
→ Subcategory Page 
→ Product Listing 
→ Product Details

Each screen must:

Link forward correctly

Link backward via:

Back button

Breadcrumb clicks

⚠️ 5. EDGE CASES (MOST DESIGNS FAIL HERE)
Case 1: Direct Entry Page

If user lands directly on Product Page:

Back button should go to Home

Breadcrumb still shows full hierarchy

Case 2: Deep Navigation

Example:

Home → Search → Product → Details

Breadcrumb must reflect:

Home > Search > Product > Details

NOT generic categories.

Case 3: Long Category Names

Truncate with ... if needed

Show full name on hover

🧩 6. COMPONENT SYSTEM (MANDATORY FOR FIGMA AI)

Create reusable components:

Components:

Back Button Component

Breadcrumb Item Component

Breadcrumb Container

Variants:

Default

Hover

Active

Disabled

🚀 7. MICRO-INTERACTIONS (ADVANCED)

Back button:

Slight slide animation on click

Breadcrumb:

Hover underline effect

Page transition:

Smooth slide (right → left when going deeper, reverse when going back)

❌ WHAT TO AVOID

Do NOT hide navigation on some pages

Do NOT make breadcrumb non-clickable

Do NOT rely only on browser back

Do NOT overload with too many levels without spacing

✅ FINAL EXPECTED RESULT

User flow should feel like:

User enters → explores deeply → never feels lost → can step back logically → always knows current position

If you want to push this further (and honestly, you should if you want KalaKart to stand out), next step is: