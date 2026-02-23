# TODO: Reviewer Selection for Document Submission

## Task
Allow employees to choose which reviewer will receive their document for approval when clicking submit button.

## Plan - COMPLETED ✓

- [x] 1. Add API endpoint to get list of reviewers in backend/routes.py
- [x] 2. Modify submit_document endpoint to accept reviewer_id parameter
- [x] 3. Update frontend EmployeeDashboard.jsx - Add reviewer selection dropdown/modal
- [x] 4. Fix search state initialization error (use string instead of array)

## Summary of Changes

### Backend (backend/routes.py)
1. **Added `/api/document/reviewers` endpoint** - Returns list of all active reviewers with their names, emails, and office locations
2. **Modified `submit_document` endpoint** - Now accepts optional `reviewer_id` parameter:
   - If `reviewer_id` is provided: Uses the selected reviewer
   - If not provided: Falls back to office-assigned reviewer (existing behavior)

### Frontend (frontend/src/views/EmployeeDashboard.jsx)
1. **Added reviewer selection states** - `reviewers`, `showReviewerModal`, `pendingSubmitDocId`, `selectedReviewerId`
2. **Added ReviewerModal component** - A popup modal that allows employees to select a reviewer
3. **Fixed search state** - Changed from `useState([])` to `useState('')` to fix "search.toLowerCase is not a function" error
4. **Updated submit handlers** - Now open reviewer selection modal instead of direct submit
