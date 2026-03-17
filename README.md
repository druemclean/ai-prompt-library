# Marketing AI Prompt Library

Interactive prompt template library for marketing purposes. Fill in variables, preview the output, and copy ready-to-use prompts for Claude, ChatGPT, or any AI assistant.

**Live site:** [https://druemclean.github.io/ai-prompt-library/](https://druemclean.github.io/ai-prompt-library/)

## Quick Start

```bash
git clone https://github.com/druemclean/ai-prompt-library.git
cd ai-prompt-library
npm install
npm run dev
```

Open http://localhost:5173/ai-prompt-library/ in your browser.

## How to Add a New Prompt

All prompt data lives in **`src/prompts.js`**. The UI code is separate, so you never need to touch it.

### Step 1: Open `src/prompts.js`

### Step 2: Add a new object to the `PROMPTS` array

```js
{
  id: "unique-slug",           // URL-friendly ID, no spaces
  category: "analysis",        // Must match a CATEGORIES id: analysis, creative, builds, operations
  title: "My New Template",
  description: "One-sentence description of what this prompt does.",
  variables: [
    { key: "client_name", label: "Client Name", type: "text", placeholder: "e.g., Acme Corp" },
    { key: "platform", label: "Platform", type: "select", options: ["Google Ads", "Meta Ads", "Both"] },
    // Add a conditional field:
    // { key: "custom_field", label: "Details", type: "text", placeholder: "...", condition: { key: "platform", value: "Both" } },
  ],
  template: `Your prompt text here with {{client_name}} and {{platform}} placeholders.

The double-brace placeholders get replaced with the variable values.`,
  // Optional: for conditional logic in the template
  // postProcess: (values, output) => {
  //   return output.replace("{{some_placeholder}}", someLogic);
  // },
},
```

### Step 3: Save, commit, and push

```bash
git add src/prompts.js
git commit -m "Add [template name] prompt template"
git push
```

GitHub Actions will automatically rebuild and deploy the site within ~2 minutes.

### Adding a New Category

Add to the `CATEGORIES` array in `src/prompts.js`:

```js
{ id: "reporting", label: "Reporting", icon: "📈" },
```

Then use `"reporting"` as the `category` value on your new prompts.

## Project Structure

```
src/
  prompts.js         <-- ALL prompt data lives here (edit this file)
  theme.js           <-- OpGo brand colors
  PromptLibrary.jsx  <-- UI component (rarely needs editing)
  App.jsx            <-- App wrapper
  main.jsx           <-- Entry point
  index.css          <-- Minimal global styles
```

## Deployment

This repo uses GitHub Actions to automatically deploy to GitHub Pages on every push to `main`. The workflow is in `.github/workflows/deploy.yml`.

### First-time setup

1. Push this repo to GitHub
2. Go to **Settings > Pages** in the GitHub repo
3. Under "Build and deployment", set Source to **GitHub Actions**
4. Push any commit to `main` (or manually trigger the workflow)

## Tech Stack

Vite + React. No external UI libraries. Inline styles with OpGo brand tokens.
