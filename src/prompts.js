/**
 * Marketing Prompt Library - Prompt Data
 * =============================================
 *
 * HOW TO ADD A NEW PROMPT:
 * 1. Add a new object to the PROMPTS array below
 * 2. Each prompt needs: id, category, title, description, variables[], template
 * 3. Optional: postProcess function for conditional template logic
 *
 * CATEGORIES (add new ones to CATEGORIES array if needed):
 *   - "analysis"   -> Analysis
 *   - "creative"   -> Creative
 *   - "builds"     -> Builds & Docs
 *   - "operations" -> Operations
 *
 * VARIABLE TYPES:
 *   - { type: "text", key, label, placeholder }
 *   - { type: "select", key, label, options: ["Option 1", "Option 2"] }
 *   - Add `condition: { key: "other_field_key", value: "trigger_value" }` to show conditionally
 */

export const CATEGORIES = [
  { id: "analysis", label: "Analysis", icon: "\u{1F4CA}" },
  { id: "creative", label: "Creative", icon: "\u{1F4DD}" },
  { id: "builds", label: "Builds & Docs", icon: "\u{1F3D7}\uFE0F" },
  { id: "operations", label: "Operations", icon: "\u2699\uFE0F" },
];

export const PROMPTS = [
  {
    id: "search-terms",
    category: "analysis",
    title: "Search Terms Analysis",
    description: "Analyze a Google Ads search terms report for wasted spend, keyword mapping issues, negative keyword opportunities, and new keyword ideas.",
    variables: [
      { key: "client_name", label: "Client Name", type: "text", placeholder: "e.g., Austin's Towing & Recovery" },
      { key: "campaign_names", label: "Campaign Name(s)", type: "text", placeholder: "e.g., Search - Heavy Duty - Leads" },
      { key: "campaign_goal", label: "Campaign Goal", type: "select", options: ["Lead generation (calls/forms)", "E-commerce sales", "Brand awareness/traffic", "Other"] },
      { key: "target_services", label: "Target Services/Products", type: "text", placeholder: "e.g., heavy-duty towing, semi recovery, long haul transport" },
      { key: "geo_target", label: "Geographic Target", type: "text", placeholder: "e.g., 60-mile radius around Fargo-Moorhead" },
      { key: "date_range", label: "Date Range of Export", type: "text", placeholder: "e.g., Feb 5 - Mar 15, 2026" },
      { key: "monthly_budget", label: "Monthly Budget", type: "text", placeholder: "e.g., $1,000/mo" },
      { key: "irrelevant_topics", label: "Known Irrelevant Topics to Flag", type: "text", placeholder: "e.g., light-duty towing, car towing, DIY, jobs/careers" },
      { key: "custom_goal", label: "Custom Goal Details (if Other)", type: "text", placeholder: "Describe the campaign goal", condition: { key: "campaign_goal", value: "Other" } },
    ],
    template: `I'm uploading a Google Ads search terms report export (CSV) for {{client_name}}.

## Campaign context
- Campaign name(s): {{campaign_names}}
- Campaign goal: {{campaign_goal}}{{custom_goal_line}}
- Target services/products: {{target_services}}
- Geographic target: {{geo_target}}
- Date range of this export: {{date_range}}
- Monthly budget: {{monthly_budget}}
- Known irrelevant topics to flag: {{irrelevant_topics}}

## What I need

Analyze the search terms report and produce the following:

### 1. Wasted spend summary
- Search terms with cost but zero conversions, sorted by spend (descending)
- Flag any single term consuming more than 10% of total spend with no conversions as CRITICAL
- Group related wasted terms into themes (e.g., "job-related queries," "DIY queries," "wrong service type")

### 2. Top performing terms
- Search terms with conversions, sorted by cost per conversion (ascending)
- Highlight any terms with conversion rates significantly above the campaign average

### 3. Keyword-to-search-term mapping
- For each ad group, show which keyword triggered which search terms
- Flag search terms that are landing in the wrong ad group based on intent

### 4. Match type analysis
- Break down performance by match type (exact, phrase, broad)
- Flag any broad match terms driving high spend with poor performance

### 5. Negative keyword recommendations
- Recommend new negative keywords based on irrelevant or wasteful search terms
- Specify match type for each recommendation (exact, phrase)
- Note whether each negative should be applied at ad group level (traffic routing) or campaign/account level (universal)

### 6. New keyword opportunities
- Identify high-performing search terms that are not yet added as exact or phrase match keywords
- Recommend which ad group they belong in

### 7. Executive summary (put this at the top)
- 3-5 bullet takeaways: what's working, what's bleeding money, and what to do first
- Use severity labels: CRITICAL, WARNING, NOTE

## Output format
- Produce as a downloadable markdown file
- Use tables for data, prose for strategic context
- Include the client name, date range, and campaign name(s) in the header`,
    postProcess: (values, output) => {
      const customLine = values.campaign_goal === "Other" && values.custom_goal
        ? `\n- Custom goal details: ${values.custom_goal}`
        : "";
      return output.replace("{{custom_goal_line}}", customLine);
    },
  },
  {
    id: "ad-copy",
    category: "creative",
    title: "Ad Copy Generation",
    description: "Generate headlines, descriptions, and sitelinks for Google Ads campaigns with character counts and QC.",
    variables: [
      { key: "client_name", label: "Client Name", type: "text", placeholder: "e.g., Evolution Design" },
      { key: "campaign_type", label: "Campaign Type", type: "select", options: ["Google Ads - Search RSA", "Google Ads - PMax Asset Group", "Meta - Primary Text + Headlines", "All of the above"] },
      { key: "service_product", label: "Service/Product Being Advertised", type: "text", placeholder: "e.g., granite countertops, semi truck towing" },
      { key: "target_audience", label: "Target Audience", type: "text", placeholder: "e.g., homeowners in Fargo-Moorhead area considering a kitchen remodel" },
      { key: "landing_page", label: "Landing Page URL", type: "text", placeholder: "e.g., https://www.example.com/service-page/" },
      { key: "tone", label: "Tone/Voice", type: "select", options: ["Professional & trustworthy", "Casual & friendly", "Urgent & action-oriented", "Premium & luxury", "Other"] },
      { key: "must_include", label: "Must-Include Phrases", type: "text", placeholder: "e.g., brand name, tagline, phone number" },
      { key: "banned_phrases", label: "Banned Phrases/Words", type: "text", placeholder: "e.g., cheap, free estimate, #1" },
      { key: "usp", label: "Key Differentiators / USPs", type: "text", placeholder: "e.g., 24/7 service, locally owned, 20+ years experience" },
    ],
    template: `I need ad copy for {{client_name}}'s {{campaign_type}} campaign.

## Context
- Service/product: {{service_product}}
- Target audience: {{target_audience}}
- Landing page: {{landing_page}} (fetch this page for messaging context)
- Tone: {{tone}}
- Must-include phrases: {{must_include}}
- Do NOT use: {{banned_phrases}}
- Key differentiators: {{usp}}

## What I need

### For Google Ads Search RSA:
- 15 headlines (max 30 characters each) - output as a table with columns: #, Headline, Characters, Pin Recommendation
- 4 descriptions (max 90 characters each) - same table format
- Pin H1 to position 1. Recommend H2 pin if appropriate.
- Flag any headline over 28 characters as "close to limit"

### For Google Ads PMax Asset Group:
- 15 short headlines (max 30 characters)
- 5 long headlines (max 90 characters)
- 5 descriptions (max 90 characters)
- 20 search themes
- Output each as a table with character counts

### For Meta:
- 3 primary text options (varying lengths: short, medium, long)
- 5 headline options (max 40 characters recommended)
- 3 description options (max 30 characters recommended)

### Also generate:
- 4 sitelink ideas with description line 1 and description line 2
- 7 callout extensions (max 25 characters each)
- 1 structured snippet with header and values

## QC checklist (apply automatically):
- No headline should repeat the same core message as another
- Verify all character counts are within limits
- Ensure brand name appears in at least 2 headlines
- Include at least 1 CTA headline ("Call Now," "Get a Quote," etc.)
- Flag any copy that could violate Google Ads editorial policies`,
  },
  {
    id: "campaign-reference",
    category: "builds",
    title: "Campaign Build Reference Doc",
    description: "Generate a structured reference document from a Google Ads Editor CSV export, covering settings, ad groups, keywords, and assets.",
    variables: [
      { key: "client_name", label: "Client Name", type: "text", placeholder: "e.g., Austin's Towing & Recovery" },
      { key: "campaign_type", label: "Campaign Type", type: "select", options: ["Search", "Performance Max", "Both (multi-campaign export)"] },
      { key: "account_manager", label: "Account Manager", type: "select", options: ["Haley", "Alex", "Haylee", "Mack", "Tiff"] },
      { key: "export_date", label: "Export Date", type: "text", placeholder: "e.g., 2026-03-15" },
      { key: "context_notes", label: "Additional Context (optional)", type: "text", placeholder: "e.g., This is a new build, or This is an audit of an existing campaign" },
    ],
    template: `I just exported this campaign from Google Ads Editor for {{client_name}}. The CSV is attached.

## Details
- Campaign type: {{campaign_type}}
- Account manager: {{account_manager}}
- Export date: {{export_date}}
- Context: {{context_notes}}

## What I need

Create a comprehensive reference document in markdown format (like the ATR PMax and Search reference docs). Include:

### Campaign-Level:
- Campaign settings table (bid strategy, budget, networks, location targeting, languages, start date)
- Location exclusions (states and countries)
- Conversion goal and Final URL expansion setting
- AI Max / text customization status
- Negative keyword list name and count

### Per Ad Group (Search) or Per Asset Group (PMax):
- Status and ad strength
- Final URL and display paths
- All headlines with character counts (and pin positions if applicable)
- All descriptions with character counts
- Long headlines (PMax only) with character counts
- Keywords by match type with tables (Search only)
- Search themes (PMax only)
- Ad group-level negative keywords with match type and purpose (Search only)

### Account-Level Assets:
- Sitelinks (campaign-level and account-level, flagging duplicates)
- Callouts
- Structured snippets
- Call assets
- Promotion assets
- Brand guidelines (PMax only)

### QC Section at the End:
- Flag ad strength issues
- Flag missing asset slots (e.g., "AG2 has 13/15 headlines, room for 2 more")
- Flag duplicate sitelinks
- Flag any settings that look non-standard
- Use severity labels: CRITICAL, WARNING, NOTE

## Output format
- Downloadable markdown file
- Filename: {{client_name}}_[Campaign Type]_Reference_[date].md
- Include metadata header with project name, client, AM, and last-updated date`,
  },
  {
    id: "project-instructions",
    category: "operations",
    title: "Client Project Instructions Generator",
    description: "Pull data from SSOT, Google Drive, Monday.com, and past conversations to generate Claude project instructions for a client.",
    variables: [
      { key: "client_name", label: "Client Name", type: "text", placeholder: "e.g., Home Equity Partner" },
      { key: "client_id", label: "Client ID (from SSOT)", type: "text", placeholder: "e.g., HEP, ATR, NSA" },
      { key: "focus_areas", label: "Primary Focus Areas", type: "text", placeholder: "e.g., Google Ads campaign builds, Meta tracking, reporting" },
      { key: "additional_context", label: "Additional Context (optional)", type: "text", placeholder: "e.g., We're about to start a new PMax campaign, or Focus on Meta ads tracking" },
    ],
    template: `Generate Claude project instructions for: {{client_name}}

Use the following process:
1. Pull the client's data from the SSOT tables (clients.csv, ga4.csv, google_ads.csv, domains.csv, social.csv, gtm.csv, name_mappings.csv) using client_id: {{client_id}}
2. Search my Google Drive for relevant docs (meeting notes, campaign references, tracking explainers, past audits)
3. Check Monday.com for active boards and recent tasks related to this client
4. Search past conversations for any context about this client

Then generate a complete project instruction document in markdown that I can paste into a new Claude project. The instructions should include:

**Section 1 - Client Identity**
- Client name, abbreviation, client_id
- Website, industry/vertical, restricted category status (if applicable)
- Account manager, service type, billing info
- Client contact(s) and their roles (pull from meeting notes if available)

**Section 2 - Account IDs & Technical Infrastructure**
- GA4 measurement ID(s) and property names
- Google Ads customer ID(s)
- GTM container ID(s)
- Meta/Facebook pixel ID(s) (if known)
- Any linked accounts or integrations
- Domain(s)

**Section 3 - Current State & Active Work**
- What campaigns are running or recently ran (platform, type, status)
- What conversion tracking is in place
- Any known issues, restrictions, or blockers
- Recent meeting context or decisions

**Section 4 - Historical Context**
- Key decisions made and why
- Past strategies tried and their outcomes
- Compliance or category restrictions
- Relationship dynamics (who makes decisions, who's technical, communication style)

**Section 5 - Working Instructions**
- What Claude should do in this project (campaign builds, tracking, audits, etc.)
- Primary focus areas: {{focus_areas}}
- QC standards to apply (character counts, asset limits, naming conventions)
- File formats and output preferences
- Reference documents loaded in the project (list what I should upload)

**Section 6 - Suggested Project Knowledge Files**
- List specific files from Drive that should be uploaded to the project
- Include file names and URLs where possible

Format the output as a single markdown file ready to paste into a Claude project's custom instructions. Keep it concise but complete - prioritize info that prevents me from having to re-explain things in every conversation.

{{additional_context_block}}`,
    postProcess: (values, output) => {
      const block = values.additional_context
        ? `Additional context: ${values.additional_context}`
        : "";
      return output.replace("{{additional_context_block}}", block);
    },
  },
];
