# MockMe Documentation Standards

**Purpose:** Comprehensive documentation standards for the MockMe MVP project to ensure consistent, LLM-friendly code documentation that maintains context across development sessions.

**Created on:** June 4, 2025. 5:22 p.m. Eastern Time  
**Updated:** June 6, 2025. 12:45 p.m. Eastern Time - Enhanced timestamp format and added required timestamp headers for all documents
**Updated:** June 10, 2025. 9:35 a.m. Eastern Time - Added critical timestamp management rules and bash command requirements

## When to Apply Documentation Standards

### Automatic Application Required
- After any code modifications or bug fixes
- When adding new functions, components, or files
- When modifying existing function signatures or behavior
- Before git commits (especially for significant changes)
- When refactoring or restructuring code

### On-Demand Application  
- When requested via trigger phrases:
  - **"Apply documentation standards"** - Full comprehensive review and updates
  - **"Update docs"** - Focus on timestamps and JSDoc updates
  - **"Doc review"** - Review recent changes for documentation completeness
  - **"Follow doc standards"** - Apply all standards to current work

## Required Documentation Elements

### 1. File-Level Documentation
**Required for all code files:**

```typescript
/**
 * @file src/path/to/file.tsx
 * @description Brief description of the file's purpose and main functionality
 * @created YYYY.MM.DD H:MM PM ET
 * @updated YYYY.MM.DD H:MM PM ET - Description of what changed and why
 * 
 * @architectural-context
 * Layer: [UI Component/Page/API Route/Utility/Hook/Context/etc.]
 * Dependencies: List key dependencies and what they provide
 * Pattern: [Authentication flow/Data fetching/State management/etc.]
 * 
 * @workflow-context  
 * User Journey: [Which user workflow this supports]
 * Sequence Position: [Where this fits in the user flow]
 * Inputs: [What data/interactions this receives]
 * Outputs: [What this produces or triggers]
 * 
 * @authentication-context
 * Auth Modes: [Standard/Development Bypass/Mock Data/etc.]
 * Security: [Security considerations, RLS policies, etc.]
 * 
 * @mock-data-context (if applicable)
 * Purpose: [Why mock data is used here]
 * Behavior: [How mock data works in this context]
 * Activation: [What triggers mock mode]
 */
```

### 2. Function/Method Documentation
**Required JSDoc for all exported functions:**

```typescript
/**
 * @function functionName
 * @description Clear description of what the function does and why it exists
 * @param {Type} paramName - Description of the parameter and its purpose
 * @returns {Type} Description of what is returned
 * @throws {Error} When specific error conditions occur (if applicable)
 * @example
 * // Usage example
 * const result = functionName(param);
 */
```

### 3. Component Documentation
**Required for React components:**

```typescript
/**
 * @component ComponentName
 * @description What the component does, when it's used, and key behaviors
 * @param {Props} props - Component props with destructured description
 * @returns {JSX.Element} The rendered component JSX
 * 
 * @usage
 * <ComponentName prop1="value" prop2={data} />
 * 
 * @accessibility
 * - List any specific accessibility considerations
 * - ARIA labels, keyboard navigation, etc.
 */
```

### 4. API Route Documentation
**Required for Next.js API routes:**

```typescript
/**
 * @api {METHOD} /api/route/path
 * @description What this endpoint does and its purpose in the application
 * @param {RequestType} request - Description of expected request structure
 * @returns {ResponseType} Description of response format and status codes
 * 
 * @authentication Required/Optional/Development Bypass modes
 * @errors List possible error responses and their causes
 * @example
 * // Request example
 * POST /api/sessions { topic: "Valuation", session_type: "AI_MENTOR" }
 */
```

## Development Mode Documentation Requirements

### Environment-Conditional Behavior
**Document all development mode specific behavior:**

```typescript
// Always document dev mode conditions
if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
  // Document what this dev-only code does and why
}

// Document auth bypass patterns  
const useDevMode = isDevelopmentMode || devBypassActive;
// Explain the dual authentication modes
```

## Timestamp and Update Standards

### 🚨 CRITICAL TIMESTAMP RULES (MUST FOLLOW)

#### **Rule 1: NEVER Overwrite Existing Timestamps**
- **❌ WRONG:** Replace existing "Updated:" line with new timestamp
- **✅ CORRECT:** Add new "Updated:" line below existing ones
- **Purpose:** Preserves complete update history and change tracking

#### **Rule 2: ALWAYS Use Bash Command for Time**
- **❌ WRONG:** Guess what time it is
- **✅ CORRECT:** Run `date` command and use exact output
- **Required Process:**
```bash
# Step 1: Get actual current time
date
# Step 2: Use the exact time from command output for timestamp
```

#### **Rule 3: Cumulative Update History**
**Correct timestamp progression:**
```markdown
**Updated:** June 6, 2025. 12:45 p.m. Eastern Time - Enhanced timestamp format
**Updated:** June 7, 2025. 3:15 p.m. Eastern Time - Fixed authentication bug  
**Updated:** June 10, 2025. 9:35 a.m. Eastern Time - Added error handling
```

### Timestamp Format
**All documents must include both "Created on" and "Updated" timestamps in American format:**
- **Timezone:** Eastern Time always
- **Format:** `Month Day, Year. Hour:Minute a.m./p.m. Eastern Time`
- **Source:** MUST come from `date` bash command output
- **Examples:** 
  - `Created on: June 6, 2025. 12:45 p.m. Eastern Time`
  - `Updated: June 6, 2025. 1:30 p.m. Eastern Time - Added RAG deployment validation`

### Document Header Requirements
**Every document must start with:**
```markdown
**Purpose:** [Clear one-sentence description of document's purpose]

**Created on:** [Timestamp in American format from date command]
**Updated:** [First update timestamp with description]
**Updated:** [Second update timestamp with description]
**Updated:** [Most recent update timestamp with description]
```

### Mandatory Process for Adding Timestamps
**LLMs MUST follow this exact sequence:**

1. **Run date command:**
   ```bash
   date
   ```

2. **Convert to American format:**
   - Input: `Tue Jun 10 09:35:50 EDT 2025`
   - Output: `June 10, 2025. 9:35 a.m. Eastern Time`

3. **Add new updated line (do NOT overwrite existing):**
   ```markdown
   **Updated:** June 10, 2025. 9:35 a.m. Eastern Time - [One sentence description]
   ```

### Update Descriptions
**Include meaningful change descriptions:**
- ✅ `Updated: June 6, 2025. 1:30 p.m. Eastern Time - Added global tier toggle to authenticated layout`
- ✅ `Updated: June 6, 2025. 2:00 p.m. Eastern Time - Removed duplicate tier toggle from navbar`
- ❌ `Updated: June 6, 2025. 1:30 p.m. Eastern Time - Updated file`

## Security Documentation Requirements

### Authentication-Related Code
**Always document:**
- Development bypass mechanisms and their security implications
- RLS policy dependencies
- User data access patterns
- Session management behavior

### Environment Variable Dependencies
**Document all environment variables used:**
```typescript
// Document what each env var controls and its security implications
const isDevelopmentMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
// NEXT_PUBLIC_DEV_MODE: Controls development bypass features, MUST be false in production
```

## Code Quality Documentation


### Dependencies and Integrations
**Document external dependencies:**
- Why specific libraries were chosen
- Integration patterns with Supabase, n8n, etc.
- Fallback behaviors for external service failures

## Documentation Review Checklist

When applying documentation standards, verify:

- [ ] **TIMESTAMP RULES FOLLOWED:** Used `date` command for accurate time
- [ ] **NO TIMESTAMP OVERWRITING:** Added new "Updated:" lines without replacing existing ones
- [ ] **File headers** have current timestamps and change descriptions
- [ ] **All modified functions** have complete JSDoc comments
- [ ] **New components** include architectural and workflow context
- [ ] **Development mode behavior** is clearly documented
- [ ] **Authentication patterns** are explained with security notes
- [ ] **Error handling** and edge cases are documented
- [ ] **Environment dependencies** are listed and explained
- [ ] **Integration points** (API calls, external services) are documented
- [ ] **Mock data usage** includes purpose and activation conditions
- [ ] **TypeScript types** are documented when complex or non-obvious

## Trigger Phrase Reference

- **"Apply documentation standards"** → Full comprehensive review using this entire file
- **"Update docs"** → Focus on timestamps, JSDoc, and file headers  
- **"Doc review"** → Review recent changes against this checklist
- **"Follow doc standards"** → Apply all standards to current work session

## Examples and Templates

### Complete File Header Example
```typescript
/**
 * @file src/components/ui/DeveloperTierToggle.tsx
 * @description Component to allow developers to override the effective user tier for testing T1/T2 features. Only visible when NEXT_PUBLIC_DEV_MODE is true.
 * @created 2025.05.28 6:55 PM ET
 * @updated 2025.01.06 7:45 PM ET - Moved to top-right positioning, now globally available in authenticated layout
 * 
 * @architectural-context
 * Layer: UI Component (Developer Utility)
 * Dependencies: contexts/AuthContext (for tier override functionality)
 * Pattern: Conditional rendering based on environment variables
 * 
 * @workflow-context
 * User Journey: Developer Testing & Feature Validation
 * Sequence Position: Available globally on all authenticated pages during development
 * Inputs: Developer selection of T1/T2 tier override
 * Outputs: Updates effective tier in AuthContext for testing
 * 
 * @authentication-context
 * Auth Modes: Development only (hidden in production)
 * Security: Visibility gated by NEXT_PUBLIC_DEV_MODE environment variable
 * 
 * @mock-data-context
 * Purpose: Enables testing of tier-specific features without database tier changes
 * Behavior: Overrides user's actual tier for UI testing purposes
 * Activation: Only when NEXT_PUBLIC_DEV_MODE=true
 */
```

### Function Documentation Example
```typescript
/**
 * @function getDevModeConfig
 * @description Determines the current development mode configuration based on environment variables
 * @returns {DevModeConfig} Configuration object with FULL_MOCK_MODE and AUTH_BYPASS_WITH_DB_WRITES flags
 * @example
 * const config = getDevModeConfig();
 * if (config.FULL_MOCK_MODE) {
 *   return mockData;
 * }
 */