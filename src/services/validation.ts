/**
 * @file src/services/validation.ts
 * @description Client-side validation service for markdown file structure and content validation
 * @created June 14, 2025. 4:05 p.m. Eastern Time
 * @updated June 19, 2025. 12:03 PM Eastern Time - Added 'Question' to ALLOWED_QUESTION_TYPES to match backend validation
 * @updated June 19, 2025. 12:15 PM Eastern Time - Fixed regex patterns to handle indented content and match backend validation
 * 
 * @architectural-context
 * Layer: Frontend Service Layer (validation logic)
 * Dependencies: TypeScript, File API, regex patterns
 * Pattern: Service pattern for reusable validation logic
 * 
 * @workflow-context
 * User Journey: File upload workflow - step 1 client-side validation
 * Sequence Position: Pre-server validation to provide immediate feedback
 * Inputs: File object from file input
 * Outputs: ValidationResult with detailed feedback
 * 
 * @validation-context
 * Purpose: Immediate format checking before server calls
 * Scope: Markdown structure, hierarchy, required patterns
 * Performance: <100ms for typical files, runs in browser main thread
 */

/**
 * @interface MarkdownValidationResult
 * @description Result of client-side markdown validation
 */
export interface MarkdownValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    lineNumbers: Record<string, number>;
    parsedCount: number;
}

/**
 * @constant MARKDOWN_PATTERNS
 * @description Regex patterns for validating markdown file structure
 */
const MARKDOWN_PATTERNS = {
    topic: /^# Topic: (.+)$/m,
    subtopic: /^## Subtopic.*?: (.+)$/m,
    difficulty: /^### Difficulty: (Basic|Advanced)$/m,
    type: /^#### Type: (.+)$/m,
    question: /^\s*\*\*Question:\*\* (.+)$/m,  // Allow leading whitespace
    answer: /^\s*\*\*Answer:\*\*/m  // Match backend pattern - use "Answer" not "Brief Answer" and allow leading whitespace
};

/**
 * @constant ALLOWED_QUESTION_TYPES
 * @description Valid question types that match backend constraints
 */
const ALLOWED_QUESTION_TYPES = [
    'Definition', 
    'Problem', 
    'GenConcept', 
    'Calculation', 
    'Analysis',
    'Question'
];

/**
 * @constant FILE_CONSTRAINTS
 * @description File size and type constraints
 */
const FILE_CONSTRAINTS = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['.md', '.txt'],
    maxLines: 10000
};

/**
 * @function validateMarkdownFormat
 * @description Main validation function for markdown file format
 * @param file - File object to validate
 * @returns Promise<MarkdownValidationResult> - Validation result with detailed feedback
 * @example
 * ```typescript
 * const file = fileInput.files[0];
 * const result = await validateMarkdownFormat(file);
 * if (result.isValid) {
 *     console.log(`Found ${result.parsedCount} questions`);
 * } else {
 *     console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export const validateMarkdownFormat = async (file: File): Promise<MarkdownValidationResult> => {
    const result: MarkdownValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        lineNumbers: {},
        parsedCount: 0
    };

    try {
        // Validate file constraints
        const fileErrors = validateFileConstraints(file);
        if (fileErrors.length > 0) {
            result.errors.push(...fileErrors);
            result.isValid = false;
            return result;
        }

        // Read file content
        const content = await readFileContent(file);
        const lines = content.split('\n');

        // Check basic structure
        const structureErrors = checkMarkdownHierarchy(content, lines);
        result.errors.push(...structureErrors);

        // Validate question blocks
        const questionValidation = validateQuestionBlocks(content, lines);
        result.errors.push(...questionValidation.errors);
        result.warnings.push(...questionValidation.warnings);
        result.parsedCount = questionValidation.questionCount;

        // Set final validity
        result.isValid = result.errors.length === 0;

        return result;
    } catch (error) {
        result.isValid = false;
        result.errors.push(`File reading error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return result;
    }
};

/**
 * @function validateFileConstraints
 * @description Validates file size, type, and basic properties
 * @param file - File object to validate
 * @returns string[] - Array of validation errors
 */
const validateFileConstraints = (file: File): string[] => {
    const errors: string[] = [];

    // Check file size
    if (file.size > FILE_CONSTRAINTS.maxSize) {
        errors.push(`File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds 10MB limit`);
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!FILE_CONSTRAINTS.allowedExtensions.includes(extension)) {
        errors.push(`Invalid file type: ${extension}. Allowed: ${FILE_CONSTRAINTS.allowedExtensions.join(', ')}`);
    }

    // Check file name
    if (!file.name || file.name.trim() === '') {
        errors.push('File must have a valid name');
    }

    return errors;
};

/**
 * @function readFileContent
 * @description Reads file content as UTF-8 text
 * @param file - File object to read
 * @returns Promise<string> - File content as string
 */
const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content.split('\n').length > FILE_CONSTRAINTS.maxLines) {
                reject(new Error(`File too long: exceeds ${FILE_CONSTRAINTS.maxLines} lines`));
            } else {
                resolve(content);
            }
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file, 'utf-8');
    });
};

/**
 * @function checkMarkdownHierarchy
 * @description Validates markdown heading hierarchy and required sections
 * @param content - File content string
 * @param lines - Array of content lines
 * @returns string[] - Array of validation errors
 */
const checkMarkdownHierarchy = (content: string, lines: string[]): string[] => {
    const errors: string[] = [];
    
    // Check for required top-level sections
    if (!MARKDOWN_PATTERNS.topic.test(content)) {
        errors.push('Missing required "# Topic: [name]" header');
    }

    // Find all heading levels
    const headings: { level: number; text: string; line: number }[] = [];
    lines.forEach((line, index) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            headings.push({
                level: match[1].length,
                text: match[2],
                line: index + 1
            });
        }
    });

    // Validate heading hierarchy
    for (let i = 0; i < headings.length - 1; i++) {
        const current = headings[i];
        const next = headings[i + 1];
        
        // Check for proper hierarchy progression
        if (next.level > current.level + 1) {
            errors.push(`Invalid heading hierarchy on line ${next.line}: skipped from level ${current.level} to ${next.level}`);
        }
    }

    // Check for required section patterns
    const requiredPatterns = [
        { pattern: MARKDOWN_PATTERNS.subtopic, name: 'Subtopic' },
        { pattern: MARKDOWN_PATTERNS.difficulty, name: 'Difficulty' },
        { pattern: MARKDOWN_PATTERNS.type, name: 'Type' }
    ];

    requiredPatterns.forEach(({ pattern, name }) => {
        if (!pattern.test(content)) {
            errors.push(`Missing required "${name}" section with proper format`);
        }
    });

    return errors;
};

/**
 * @function validateQuestionBlocks
 * @description Validates individual question blocks and content
 * @param content - File content string
 * @param lines - Array of content lines
 * @returns object - Validation result with errors, warnings, and question count
 */
const validateQuestionBlocks = (content: string, _lines: string[]): {
    errors: string[];
    warnings: string[];
    questionCount: number;
} => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let questionCount = 0;

    // Find question blocks
    const questionBlocks = extractQuestionBlocks(content);
    
    questionBlocks.forEach((block, index) => {
        const blockNumber = index + 1;
        
        // Check for required question pattern
        if (!MARKDOWN_PATTERNS.question.test(block.content)) {
            errors.push(`Question block ${blockNumber}: Missing "**Question:** [content]" format`);
        }

        // Check for required answer pattern
        if (!MARKDOWN_PATTERNS.answer.test(block.content)) {
            errors.push(`Question block ${blockNumber}: Missing "**Answer:** [content]" format`);
        }

        // Validate question type
        const typeMatch = block.content.match(MARKDOWN_PATTERNS.type);
        if (typeMatch) {
            const questionType = typeMatch[1];
            if (!ALLOWED_QUESTION_TYPES.includes(questionType)) {
                errors.push(`Question block ${blockNumber}: Invalid type "${questionType}". Must be one of: ${ALLOWED_QUESTION_TYPES.join(', ')}`);
            }
        }

        // Validate difficulty
        const difficultyMatch = block.content.match(MARKDOWN_PATTERNS.difficulty);
        if (difficultyMatch) {
            const difficulty = difficultyMatch[1];
            if (!['Basic', 'Advanced'].includes(difficulty)) {
                errors.push(`Question block ${blockNumber}: Invalid difficulty "${difficulty}". Must be "Basic" or "Advanced"`);
            }
        }

        // Check content length warnings
        const questionMatch = block.content.match(MARKDOWN_PATTERNS.question);
        if (questionMatch && questionMatch[1].length > 500) {
            warnings.push(`Question block ${blockNumber}: Question text is very long (${questionMatch[1].length} chars)`);
        }

        // For answer length, extract the actual answer content (everything after **Brief Answer:**)
        const answerHeaderMatch = block.content.match(/^\*\*Brief Answer:\*\*/m);
        if (answerHeaderMatch) {
            const answerStartIndex = block.content.indexOf('**Brief Answer:**') + '**Brief Answer:**'.length;
            const answerContent = block.content.substring(answerStartIndex).trim();
            if (answerContent.length > 1000) {
                warnings.push(`Question block ${blockNumber}: Answer text is very long (${answerContent.length} chars)`);
            }
            // Also check if answer is empty
            if (answerContent.length === 0) {
                errors.push(`Question block ${blockNumber}: Answer content is empty after "**Brief Answer:**"`);
            }
        }

        questionCount++;
    });

    // Check if any questions were found
    if (questionCount === 0) {
        errors.push('No valid question blocks found in file');
    }

    return { errors, warnings, questionCount };
};

/**
 * @function extractQuestionBlocks
 * @description Extracts individual question blocks from markdown content
 * @param content - File content string
 * @returns Array of question blocks with content and line numbers
 */
const extractQuestionBlocks = (content: string): Array<{ content: string; startLine: number; endLine: number }> => {
    const blocks: Array<{ content: string; startLine: number; endLine: number }> = [];
    const lines = content.split('\n');
    
    let currentBlock: string[] = [];
    let blockStartLine = 0;
    let inQuestionBlock = false;

    lines.forEach((line, index) => {
        // Start of new question block (#### Type:)
        if (line.match(/^#### Type:/)) {
            // Save previous block if exists
            if (currentBlock.length > 0) {
                blocks.push({
                    content: currentBlock.join('\n'),
                    startLine: blockStartLine,
                    endLine: index
                });
            }
            
            // Start new block
            currentBlock = [line];
            blockStartLine = index + 1;
            inQuestionBlock = true;
        } 
        // End of question block (next heading or EOF)
        else if (line.match(/^#{1,4}\s/) && inQuestionBlock) {
            // Save current block
            if (currentBlock.length > 0) {
                blocks.push({
                    content: currentBlock.join('\n'),
                    startLine: blockStartLine,
                    endLine: index
                });
            }
            
            currentBlock = [];
            inQuestionBlock = false;
        }
        // Continue building current block
        else if (inQuestionBlock) {
            currentBlock.push(line);
        }
    });

    // Handle last block
    if (currentBlock.length > 0 && inQuestionBlock) {
        blocks.push({
            content: currentBlock.join('\n'),
            startLine: blockStartLine,
            endLine: lines.length
        });
    }

    return blocks;
};

/**
 * @function getValidationSummary
 * @description Creates user-friendly validation summary
 * @param result - Validation result object
 * @returns string - Human-readable summary
 * @example
 * ```typescript
 * const summary = getValidationSummary(validationResult);
 * toast.success(summary);
 * ```
 */
export const getValidationSummary = (result: MarkdownValidationResult): string => {
    if (result.isValid) {
        return `✅ File validated successfully! Found ${result.parsedCount} questions.`;
    } else {
        return `❌ Validation failed: ${result.errors.length} error${result.errors.length !== 1 ? 's' : ''} found.`;
    }
};

/**
 * @function isMarkdownFile
 * @description Quick check if file appears to be a markdown file
 * @param file - File object to check
 * @returns boolean - True if file appears to be markdown
 */
export const isMarkdownFile = (file: File): boolean => {
    const extension = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
    return FILE_CONSTRAINTS.allowedExtensions.includes(extension);
};