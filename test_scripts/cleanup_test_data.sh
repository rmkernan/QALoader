#!/bin/bash

# Cleanup Test Data Script
# Created: June 19, 2025. 6:30 PM Eastern Time  
# Purpose: Remove test data from database after testing

set -e

# Source configuration
source ./config.sh

# Function to delete questions by IDs
delete_questions_by_ids() {
    local question_ids="$1"
    local filename="$2"
    
    if [ -z "$question_ids" ]; then
        echo -e "${YELLOW}⚠ No question IDs to delete for ${filename}${NC}"
        return 0
    fi
    
    # Convert to array format for batch deletion
    local ids_array=$(echo "$question_ids" | tr ',' '\n' | jq -R . | jq -s .)
    local request_body=$(echo '{}' | jq --argjson ids "$ids_array" '.question_ids = $ids')
    
    echo -e "${BLUE}Deleting questions from ${filename}...${NC}"
    
    # Call delete API
    local response=$(curl -s -X DELETE \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$request_body" \
        "${DELETE_ENDPOINT}")
    
    # Check response
    local deleted_count=$(echo "$response" | jq -r '.deleted_count // 0' 2>/dev/null || echo "0")
    local expected_count=$(echo "$question_ids" | tr ',' '\n' | wc -l)
    
    if [ "$deleted_count" -eq "$expected_count" ]; then
        echo -e "${GREEN}✓ Successfully deleted ${deleted_count} questions from ${filename}${NC}"
        log_result "CLEANUP SUCCESS: ${filename} - ${deleted_count} questions deleted"
        return 0
    else
        echo -e "${RED}✗ Failed to delete all questions from ${filename} (deleted ${deleted_count}/${expected_count})${NC}"
        log_result "CLEANUP PARTIAL: ${filename} - ${deleted_count}/${expected_count} questions deleted"
        return 1
    fi
}

# Function to cleanup a single test file's data
cleanup_test_file() {
    local filename="$1"
    local basename="${filename%.md}"
    local question_ids_file="${RESULTS_DIR}/${basename}_question_ids.txt"
    
    if [ ! -f "$question_ids_file" ]; then
        echo -e "${YELLOW}⚠ Question IDs file not found: ${question_ids_file}${NC}"
        echo "  Skipping cleanup for ${filename}"
        return 0
    fi
    
    local question_ids=$(cat "$question_ids_file" | tr '\n' ',' | sed 's/,$//')
    delete_questions_by_ids "$question_ids" "$filename"
}

# Function to verify cleanup completed
verify_cleanup() {
    echo -e "${BLUE}Verifying cleanup completion...${NC}"
    
    local response=$(curl -s -X GET \
        -H "Authorization: Bearer $JWT_TOKEN" \
        "${QUESTIONS_ENDPOINT}")
    
    local total_questions=$(echo "$response" | jq -r '. | length' 2>/dev/null || echo "unknown")
    
    echo "Remaining questions in database: $total_questions"
    log_result "CLEANUP VERIFICATION: ${total_questions} questions remaining in database"
}

# Function to archive test results
archive_test_results() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local archive_dir="${RESULTS_DIR}/archive_${timestamp}"
    
    echo -e "${BLUE}Archiving test results...${NC}"
    
    mkdir -p "$archive_dir"
    
    # Copy all results files to archive
    if [ -d "$RESULTS_DIR" ]; then
        cp "$RESULTS_DIR"/*.txt "$archive_dir/" 2>/dev/null || true
        cp "$RESULTS_DIR"/*.json "$archive_dir/" 2>/dev/null || true
        
        echo -e "${GREEN}✓ Test results archived to ${archive_dir}${NC}"
        log_result "ARCHIVE COMPLETE: Results saved to ${archive_dir}"
    fi
}

# Main execution
main() {
    echo -e "${YELLOW}=== Test Data Cleanup ===${NC}"
    echo "Removing test data from database..."
    
    # Check prerequisites
    check_auth_token
    check_backend
    
    if [ ! -d "$RESULTS_DIR" ]; then
        echo -e "${RED}Error: Results directory not found. Nothing to cleanup.${NC}"
        exit 1
    fi
    
    local cleanup_count=0
    local success_count=0
    
    # Cleanup each test file's data
    for filename in "${!TEST_FILES[@]}"; do
        echo
        cleanup_count=$((cleanup_count + 1))
        
        if cleanup_test_file "$filename"; then
            success_count=$((success_count + 1))
        fi
    done
    
    echo
    verify_cleanup
    
    echo
    echo -e "${YELLOW}=== Cleanup Summary ===${NC}"
    echo "Files processed: $cleanup_count"
    echo "Successful cleanups: $success_count"
    echo "Failed cleanups: $((cleanup_count - success_count))"
    
    # Archive results before final cleanup
    archive_test_results
    
    if [ $success_count -eq $cleanup_count ]; then
        echo -e "${GREEN}All test data cleaned up successfully!${NC}"
        log_result "CLEANUP COMPLETE: All ${cleanup_count} test files cleaned up"
        
        # Option to remove results directory
        echo
        read -p "Remove test results directory? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$RESULTS_DIR"
            echo -e "${GREEN}✓ Test results directory removed${NC}"
        else
            echo -e "${YELLOW}Test results preserved in ${RESULTS_DIR}${NC}"
        fi
        
        exit 0
    else
        echo -e "${RED}Some cleanup operations failed. Check logs for details.${NC}"
        log_result "CLEANUP INCOMPLETE: ${success_count}/${cleanup_count} files cleaned up successfully"
        exit 1
    fi
}

# Run main function
main "$@"