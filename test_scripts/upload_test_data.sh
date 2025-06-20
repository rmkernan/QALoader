#!/bin/bash

# Upload Test Data Script
# Created: June 19, 2025. 6:30 PM Eastern Time
# Updated: June 20, 2025. 8:52 AM Eastern Time - Fixed response parsing to match actual API format
# Purpose: Upload all test markdown files and capture question IDs

set -e

# Source configuration
source ./config.sh

# Function to upload a single test file
upload_test_file() {
    local filename="$1"
    local filepath="${TEST_DATA_DIR}/${filename}"
    
    echo -e "${BLUE}Uploading ${filename}...${NC}"
    
    if [ ! -f "$filepath" ]; then
        echo -e "${RED}Error: Test file not found: ${filepath}${NC}"
        return 1
    fi
    
    # Upload file and capture response
    local response=$(curl -s -X POST \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: multipart/form-data" \
        -F "file=@${filepath}" \
        "${UPLOAD_ENDPOINT}")
    
    # Check if upload was successful by looking for successful_uploads array
    local successful_count=$(echo "$response" | jq -r '.successful_uploads | length' 2>/dev/null || echo "0")
    local total_attempted=$(echo "$response" | jq -r '.total_attempted // 0' 2>/dev/null || echo "0")
    
    if [ "$successful_count" -gt 0 ]; then
        echo -e "${GREEN}✓ Successfully uploaded ${filename} (${successful_count} questions)${NC}"
        
        # Save question IDs for later use - extract from successful_uploads array
        local question_ids=$(echo "$response" | jq -r '.successful_uploads[]' 2>/dev/null || echo "")
        echo "$question_ids" > "${RESULTS_DIR}/${filename%.md}_question_ids.txt"
        
        # Save full response for debugging
        echo "$response" > "${RESULTS_DIR}/${filename%.md}_upload_response.json"
        
        log_result "UPLOAD SUCCESS: ${filename} - ${successful_count} questions"
        return 0
    else
        local error_msg=$(echo "$response" | jq -r '.errors | to_entries[0].value // "Unknown error"' 2>/dev/null || echo "Unknown error")
        echo -e "${RED}✗ Failed to upload ${filename}: ${error_msg}${NC}"
        log_result "UPLOAD FAILED: ${filename} - ${error_msg}"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${YELLOW}=== Duplicate Detection Test Data Upload ===${NC}"
    echo "Starting upload of test data files..."
    
    # Check prerequisites
    check_auth_token
    check_backend
    setup_results_dir
    
    local upload_count=0
    local success_count=0
    
    # Upload each test file
    for filename in "${!TEST_FILES[@]}"; do
        echo
        upload_count=$((upload_count + 1))
        
        if upload_test_file "$filename"; then
            success_count=$((success_count + 1))
        fi
    done
    
    echo
    echo -e "${YELLOW}=== Upload Summary ===${NC}"
    echo "Files processed: $upload_count"
    echo "Successful uploads: $success_count"
    echo "Failed uploads: $((upload_count - success_count))"
    
    if [ $success_count -eq $upload_count ]; then
        echo -e "${GREEN}All test data uploaded successfully!${NC}"
        log_result "UPLOAD COMPLETE: All ${upload_count} files uploaded successfully"
        exit 0
    else
        echo -e "${RED}Some uploads failed. Check logs for details.${NC}"
        log_result "UPLOAD INCOMPLETE: ${success_count}/${upload_count} files uploaded successfully"
        exit 1
    fi
}

# Run main function
main "$@"