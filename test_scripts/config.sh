#!/bin/bash

# Duplicate Detection Test Configuration
# Created: June 19, 2025. 6:30 PM Eastern Time
# Updated: June 20, 2025. 8:52 AM Eastern Time - Fixed question ID extraction to match API response

# Base configuration
BASE_URL="http://localhost:8000"
TEST_DATA_DIR="../test_data"
RESULTS_DIR="./test_results"

# API endpoints
UPLOAD_ENDPOINT="${BASE_URL}/api/upload-markdown"
DUPLICATES_ENDPOINT="${BASE_URL}/api/duplicates"
SCAN_ENDPOINT="${BASE_URL}/api/duplicates/scan"
DELETE_ENDPOINT="${BASE_URL}/api/duplicates/batch"
QUESTIONS_ENDPOINT="${BASE_URL}/api/questions"

# Test thresholds to validate
THRESHOLDS=(0.60 0.70 0.80 0.85 0.90)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test files with expected results
declare -A TEST_FILES
TEST_FILES[high_similarity_pairs.md]="3 pairs at 90%+"
TEST_FILES[medium_similarity_pairs.md]="3 pairs at 80-89%" 
TEST_FILES[low_similarity_pairs.md]="3 pairs at 60-79%"
TEST_FILES[clean_unique_questions.md]="0 pairs (unique)"
TEST_FILES[cross_topic_duplicates.md]="3 pairs across topics"
TEST_FILES[edge_cases.md]="2 pairs with formatting"

# Expected duplicate counts by threshold
declare -A EXPECTED_HIGH_90
EXPECTED_HIGH_90[0.90]=3
EXPECTED_HIGH_90[0.85]=3
EXPECTED_HIGH_90[0.80]=3
EXPECTED_HIGH_90[0.70]=3
EXPECTED_HIGH_90[0.60]=3

declare -A EXPECTED_MEDIUM_80
EXPECTED_MEDIUM_80[0.90]=0
EXPECTED_MEDIUM_80[0.85]=3
EXPECTED_MEDIUM_80[0.80]=3
EXPECTED_MEDIUM_80[0.70]=3
EXPECTED_MEDIUM_80[0.60]=3

declare -A EXPECTED_LOW_60
EXPECTED_LOW_60[0.90]=0
EXPECTED_LOW_60[0.85]=0
EXPECTED_LOW_60[0.80]=0
EXPECTED_LOW_60[0.70]=3
EXPECTED_LOW_60[0.60]=3

declare -A EXPECTED_UNIQUE
EXPECTED_UNIQUE[0.90]=0
EXPECTED_UNIQUE[0.85]=0
EXPECTED_UNIQUE[0.80]=0
EXPECTED_UNIQUE[0.70]=0
EXPECTED_UNIQUE[0.60]=0

# Function to check if JWT token is set
check_auth_token() {
    if [ -z "$JWT_TOKEN" ]; then
        echo -e "${RED}Error: JWT_TOKEN environment variable not set${NC}"
        echo "Please set JWT_TOKEN with a valid authentication token:"
        echo "export JWT_TOKEN=\"your_token_here\""
        exit 1
    fi
}

# Function to check if backend is running
check_backend() {
    if ! curl -s "${BASE_URL}/health" > /dev/null 2>&1; then
        echo -e "${RED}Error: Backend server not running at ${BASE_URL}${NC}"
        echo "Please start the backend server with: npm run start:backend"
        exit 1
    fi
}

# Function to create results directory
setup_results_dir() {
    mkdir -p "$RESULTS_DIR"
    echo "$(date): Test run started" > "$RESULTS_DIR/test_log.txt"
}

# Function to log results
log_result() {
    local message="$1"
    echo "$message" | tee -a "$RESULTS_DIR/test_log.txt"
}

# Function to parse JSON and extract question IDs
extract_question_ids() {
    local json_response="$1"
    # Updated to match actual API response format
    echo "$json_response" | jq -r '.successful_uploads[]? // empty' 2>/dev/null || echo ""
}

# Function to count duplicate pairs
count_duplicate_pairs() {
    local json_response="$1"
    echo "$json_response" | jq -r '.groups | length' 2>/dev/null || echo "0"
}