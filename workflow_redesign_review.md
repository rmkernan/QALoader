# Workflow Redesign Review Document

**Purpose**: Gather your feedback on the proposed changes to remove topic selection and add duplicate detection to the QA Loader workflow.

**Instructions**: Please review each section and provide your responses inline. Add your answers after each question or concern.

---

## 1. Topic Handling Strategy

### Question 1.1: Topic Removal Approach
Which approach do you prefer?

**Option A - Complete Removal**: Remove topic selection entirely, extract topics from markdown headers
- Pros: Simpler workflow, no user decision needed
- Cons: Breaking change, affects existing features, requires migration

**Option B - Make Topics Optional**: Keep topic selection but make it optional, auto-populate from file
- Pros: Backward compatible, gradual transition, preserves existing features
- Cons: More complex UI, potential user confusion

**Your Choice**: Option A. Topics are mandatory and will be present with each question in the markdown file. The topics possible in the markdown file will be the same as those possible as defined in the project currently.It should be very easy to load every question because every question will be in first normal form, with each attribute or none or unknown

**Additional Comments**: [Your thoughts here]

### Question 1.2: Mixed Topics in Single File
How should we handle files with multiple different topic headers?

**Option A**: Reject files with inconsistent topics
**Option B**: Use the first topic found for all questions
**Option C**: Store each question with its individual topic from the markdown
**Option D**: Other approach (please specify)

**Your Choice**: Files will not have topic headers. Each question will have every attribute in First Normal Form.  review Docs/Supabase/BIW_400-ib-interview-questions_p6-18_markdown_gemini-2_5-flash-preview-04-17.md To see the file format and how each question is entered. So I suppose this means option C. 

**Additional Comments**: [Your thoughts here]

---

## 2. Duplicate Detection Design

### Question 2.1: Detection Algorithm
What level of sophistication do you need for duplicate detection?

**Option A - Simple Fuzzy Matching**: 
- Uses character-based similarity (Levenshtein distance)
- Fast, easy to implement
- May miss semantically similar questions with different wording

**Option B - TF-IDF + Cosine Similarity**:
- Better for longer text comparison
- Handles word variations better
- Medium complexity

**Option C - ML-Based Semantic Similarity**:
- Uses sentence embeddings (BERT/Sentence Transformers)
- Best at finding semantically similar questions
- Requires more setup and resources

**Your Choice**: I'm not technical enough to make this decision. In some cases, there will be a direct re-upload of the same question, which should be easy to figure out. In other cases, we may have made very minor changes, but it's essentially the same question. So I need some approach which will enable us to find and identify likely duplicates and then let the user decide to keep or deny them. That should remove some of the burden of our algorithm having to be perfect in that its job is mainly to raise candidate duplicates and then ask for user review and decision. 

**Rationale**: [Why did you choose this option?]

### Question 2.2: Similarity Threshold
What percentage similarity should flag a potential duplicate?

- [ ] 70% - Very loose, catches more potential duplicates but more false positives
- [ ] 80% - Balanced approach
- [ ] 90% - Strict, only very similar questions flagged
- [ ] Other: ____%

**Your Choice**: see prior answer

### Question 2.3: Which Fields to Compare?
Which fields should be compared for duplicate detection?

- [ ] Question text only
- [ ] Question text + Answer text
- [ ] Question text + Answer text + Topic/Subtopic
- [ ] Other combination: _____________

**Your Choice**: Question Text 

---

## 3. Implementation Timing

### Question 3.1: Duplicate Check Timing
When should duplicate checking occur?

**Option A - Pre-Upload Only**: Check during validation, show preview before upload
**Option B - Post-Upload Only**: Upload everything, then provide cleanup tools
**Option C - Both**: Pre-upload warnings + post-upload cleanup tools

**Your Choice**: c

**Rationale**: Again, I need to rely on your guidance. It seems like during pre-upload, we might be able to perform some simple lookup for exact duplicates and to give the user a warning. I'm also thinking that once the questions are in Supabase, we can use some of Supabase's native tools to query, sort, match, and do more powerful, similar or identical question search. 

### Question 3.2: Priority Order
Please rank these features by implementation priority (1 = highest priority):

- [ ] Remove/modify topic selection workflow
- [ ] Add duplicate detection during upload
- [ ] Add post-upload duplicate finder in Question Manager
- [ ] Migrate existing data to new structure

**Your Ranking**
These are all required features. They should be implemented in whichever order makes most sense to you. 

---

## 4. Migration and Compatibility

### Question 4.1: Existing Data
How should we handle the existing questions in the database?

**Option A**: Leave as-is with their topics
**Option B**: Migrate to extract topics from question content
**Option C**: Add a migration tool for users to update their data
**Option D**: Other approach (please specify)

**Your Choice**: [Replace with A, B, C, or D]

**Additional Comments**: Existing data will have been deleted prior to loading these new questions, So, there's no need to worry about any of the current contents of the questions table. 

### Question 4.2: Feature Preservation
Which existing features are critical to preserve?

- [ ] Dashboard topic summaries
- [ ] Topic-based filtering in Curation View
- [ ] Topic analytics/metrics
- [ ] Batch delete by topic
- [ ] None - okay to redesign all topic-based features
- [ ] Other: _____________

**Your Selections**: We should be able to keep all of these, since every single question will have topic, subtopic, type, and difficulty attributes with them. 

---

## 5. User Experience Concerns

### Question 5.1: Duplicate Resolution UI
When duplicates are found, how should users resolve them?

- [ ] Show side-by-side comparison with differences highlighted
- [ ] List view with checkbox selection
- [ ] One-by-one review with Skip/Replace/Add buttons
- [ ] Bulk actions with filters
- [ ] Other: _____________

**Your Preferences**: One by one. 

### Question 5.2: Default Duplicate Action
What should happen by default when a duplicate is detected?

- [ ] Skip the duplicate (don't upload)
- [ ] Replace the existing question
- [ ] Add anyway (allow duplicates)
- [ ] Always ask the user

**Your Choice**: ask user

---

## 6. Technical Concerns

### Question 6.1: Performance Requirements
How many questions do you expect in the database when fully loaded?

- [ ] < 1,000 questions
- [ ] 1,000 - 10,000 questions
- [ ] 10,000 - 50,000 questions
- [ ] > 50,000 questions

**Your Estimate**: less than 1000

### Question 6.2: Response Time Expectations
What's acceptable for duplicate checking performance?

- [ ] < 1 second for small files (< 50 questions)
- [ ] < 5 seconds for medium files (50-200 questions)
- [ ] < 30 seconds for large files (> 200 questions)
- [ ] Other expectations: _____________

**Your Requirements**: Taking up to 30 seconds is no issue. If it makes sense, in our duplicate questions finder dialogue, we can require the user to look for duplicates by topic only. That would dramatically reduce the number of questions to be examined in a given duplicate search session. 

---

## 7. Risk Tolerance

### Question 7.1: Implementation Approach
Do you prefer:

**Option A - Big Bang**: Implement all changes at once
**Option B - Phased Approach**: Gradual rollout over several weeks
**Option C - Feature Flags**: Deploy but toggle features on/off

**Your Choice**: all at once, Unless you feel strongly, it should be done otherwise. 

### Question 7.2: Backup Requirements
Before making these changes, do you want:

- [ ] Full database backup
- [ ] Export of all existing questions
- [ ] Ability to rollback changes
- [ ] Test on a staging environment first
- [ ] All of the above

**Your Requirements**: The database has already been backed up and all questions have already been deleted. 

---

## 8. Additional Considerations

### Question 8.1: Question ID Format
Currently, question IDs are `TOPIC-SUBTOPIC-TYPE-001`. Without topic selection, how should IDs be generated?

**Your Suggestion**: I still want IDs to follow the same format. So, because each question is already labeled with every attribute, we should be able to dynamically generate each question's question ID in a very similar manner as to before. 

### Question 8.2: Other Concerns
Are there any other concerns, requirements, or considerations I should know about?

**Your Comments**: [Please share any additional thoughts]

### Question 8.3: Success Criteria
How will you measure if these changes are successful?

**Your Metrics**: All features implemented. 

---

## Next Steps

Once you've completed this review:
1. Save the file with your responses
2. Let me know you're done
3. I'll create a detailed implementation plan based on your feedback
4. We'll review the final plan before starting implementation

**Any questions before you begin reviewing?**: [Your questions here]

---

*Please take your time reviewing these questions. Your thoughtful responses will ensure we build exactly what you need.*