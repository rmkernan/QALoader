# Staging Workflow Debugging Guide

**Created:** June 20, 2025. 2:47 PM Eastern Time

## 🐛 Current Bug Investigation

### Bug: Duplicate Resolution Actions Failing

**Symptoms**: Clicking "Replace with New", "Keep Existing", or "Keep Both" buttons fails
**Location**: Duplicate resolution interface (`/staging/{batchId}` in duplicates view mode)
**Expected**: Button click should resolve duplicate and update UI

### Debugging Steps

1. **Check Browser DevTools Console**
   - Look for JavaScript errors when buttons are clicked
   - Check Network tab for failed API calls

2. **Check Backend Logs**
   - Look for errors in staging duplicate resolution endpoint
   - Endpoint: `POST /api/staging/duplicates/{duplicate_id}/resolve`

3. **Verify API Call Structure**
   - Function: `resolveStagingDuplicate()` in `src/services/api.ts`
   - Check request payload format
   - Verify authentication headers

4. **Check Backend Implementation**
   - Endpoint: `resolve_duplicate()` in `backend/app/routers/staging.py` (line ~381)
   - Verify current_user parameter type (should be `str`, not `dict`)
   - Check database update logic

### Known Working Elements
- ✅ Duplicate detection and display
- ✅ Question content shows correctly
- ✅ Button rendering and layout
- ✅ Duplicate data loading from API

### Likely Issue Areas
1. **Authentication parameter mismatch** in resolve endpoint
2. **Request payload format** not matching backend expectations
3. **Database constraint** preventing duplicate resolution updates
4. **Frontend state management** not handling resolution responses

## 🔍 Investigation Tools

### Frontend Debugging
```javascript
// Check duplicates state in browser console
console.log('Duplicates:', duplicates);

// Check if buttons are properly wired
// Look for handleResolveDuplicate function calls
```

### Backend Debugging
```python
# Add to resolve_duplicate endpoint for debugging
print(f"[DEBUG] Resolution request: {resolution_request}")
print(f"[DEBUG] Current user: {current_user}")
print(f"[DEBUG] Duplicate ID: {duplicate_id}")
```

### Database Verification
```sql
-- Check if resolution updates are working
SELECT duplicate_id, staged_question_id, resolution, resolved_by 
FROM staging_duplicates 
WHERE resolution IS NOT NULL;

-- Check for constraint issues
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'staging_duplicates'::regclass;
```

## 🛠 Common Fix Patterns

### Authentication Issues
- Check `current_user` parameter type in endpoints
- Verify JWT token is being passed correctly
- Ensure `get_current_user` dependency returns expected format

### Request/Response Mismatches
- Verify Pydantic model validation
- Check field naming consistency (camelCase vs snake_case)
- Validate required vs optional fields

### Database Constraint Issues
- Check foreign key relationships
- Verify enum/check constraints allow expected values
- Ensure NULL handling is correct

### Frontend State Issues
- Check if state updates after API calls
- Verify error handling displays user feedback
- Ensure loading states prevent double-clicks

## 📄 Key Files for Investigation

### Backend Files
- `backend/app/routers/staging.py` - Duplicate resolution endpoint
- `backend/app/models/staging.py` - Request/response schemas
- `backend/app/services/staging_service.py` - Business logic (if used)

### Frontend Files
- `src/components/StagingReviewView.tsx` - Resolution UI and handlers
- `src/services/api.ts` - API call implementation
- `src/types.ts` - TypeScript interfaces

### Database Schema
- `staging_duplicates` table structure
- Constraints on `resolution` field
- Foreign key relationships

## 🧪 Testing Approach

1. **Isolate the Issue**
   - Try each resolution button individually
   - Check if specific resolutions fail or all fail

2. **API Testing**
   - Test resolution endpoint directly with curl/Postman
   - Verify authentication and payload format

3. **State Verification**
   - Check if backend changes are persisted
   - Verify frontend state updates reflect changes

4. **Error Propagation**
   - Ensure errors are properly caught and displayed
   - Check toast notifications for user feedback

## 🔄 Test Data Reset

When testing fails, reset with the comprehensive SQL script from conversation history:
- Clears all staging tables
- Removes test questions from production
- Re-creates 4 test scenarios including duplicates

Location: `duplicate_batch.md` has 2 duplicates for testing resolution workflow.