#!/bin/bash

# Validate Duplicates Script  
# Created: June 19, 2025. 6:30 PM Eastern Time
# Purpose: Test duplicate detection at various thresholds and validate accuracy

set -e

# Source configuration
source ./config.sh

# Function to test duplicate detection for a specific file and threshold
test_duplicate_detection() {
    local filename="$1"
    local threshold="$2"
    local expected_count="$3"
    
    local basename="${filename%.md}"
    local question_ids_file="${RESULTS_DIR}/${basename}_question_ids.txt"
    
    # Check if question IDs file exists
    if [ ! -f "$question_ids_file" ]; then
        echo -e "${RED}✗ Question IDs file not found: ${question_ids_file}${NC}"
        return 1
    fi
    
    # Read question IDs
    local question_ids=$(cat "$question_ids_file" | tr '\n' ',' | sed 's/,$//')
    
    if [ -z "$question_ids" ]; then
        echo -e "${RED}✗ No question IDs found for ${filename}${NC}"
        return 1
    fi
    
    # Call duplicate detection API
    local response=$(curl -s -X GET \
        -H "Authorization: Bearer $JWT_TOKEN" \
        "${SCAN_ENDPOINT}?question_ids=${question_ids}&threshold=${threshold}")
    
    # Parse response
    local duplicate_count=$(count_duplicate_pairs "$response")
    
    # Save response for debugging
    echo "$response" > "${RESULTS_DIR}/${basename}_duplicates_${threshold}.json"
    
    # Validate result
    if [ "$duplicate_count" -eq "$expected_count" ]; then
        echo -e "${GREEN}✓ ${filename} @ ${threshold}: Found ${duplicate_count} pairs (expected ${expected_count})${NC}"
        log_result "PASS: ${filename} @ ${threshold} - ${duplicate_count}/${expected_count} pairs"
        return 0
    else
        echo -e "${RED}✗ ${filename} @ ${threshold}: Found ${duplicate_count} pairs (expected ${expected_count})${NC}"
        log_result "FAIL: ${filename} @ ${threshold} - ${duplicate_count}/${expected_count} pairs"
        return 1
    fi
}

# Function to run all tests for a specific file
test_file_at_all_thresholds() {
    local filename="$1"
    local test_type="$2"
    
    echo -e "${BLUE}Testing ${filename} (${test_type})...${NC}"
    
    local pass_count=0
    local total_tests=0
    
    for threshold in "${THRESHOLDS[@]}"; do
        total_tests=$((total_tests + 1))
        
        # Get expected count based on test type and threshold
        local expected_count=0
        case "$test_type" in
            "high")
                expected_count=${EXPECTED_HIGH_90[$threshold]}
                ;;
            "medium")
                expected_count=${EXPECTED_MEDIUM_80[$threshold]}
                ;;
            "low")
                expected_count=${EXPECTED_LOW_60[$threshold]}
                ;;
            "unique")
                expected_count=${EXPECTED_UNIQUE[$threshold]}
                ;;
            "cross")
                # Cross-topic should behave like medium similarity
                expected_count=${EXPECTED_MEDIUM_80[$threshold]}
                ;;
            "edge")
                # Edge cases should behave like high similarity
                expected_count=${EXPECTED_HIGH_90[$threshold]}
                ;;
        esac
        
        if test_duplicate_detection "$filename" "$threshold" "$expected_count"; then
            pass_count=$((pass_count + 1))
        fi
    done
    
    echo "  Result: ${pass_count}/${total_tests} tests passed"
    return $((total_tests - pass_count))
}

# Function to generate test report
generate_test_report() {
    local total_passed="$1"
    local total_tests="$2"
    
    echo -e "${YELLOW}=== Duplicate Detection Test Report ===${NC}"
    echo "Test execution completed: $(date)"
    echo "Total tests: $total_tests"
    echo "Passed: $total_passed"
    echo "Failed: $((total_tests - total_passed))"
    echo "Success rate: $(echo "scale=1; $total_passed * 100 / $total_tests" | bc -l)%"
    echo
    
    # Detailed results by file
    echo "Detailed Results:"
    echo "=================="
    
    for filename in "${!TEST_FILES[@]}"; do
        local description="${TEST_FILES[$filename]}"
        echo "File: $filename"
        echo "Expected: $description"
        
        # Count passes/fails for this file
        local file_passes=$(grep "PASS.*${filename}" "$RESULTS_DIR/test_log.txt" | wc -l)
        local file_fails=$(grep "FAIL.*${filename}" "$RESULTS_DIR/test_log.txt" | wc -l)
        
        echo "Results: ${file_passes} passed, ${file_fails} failed"
        echo "---"
    done
    
    # Recommendations
    echo
    echo "Recommendations:"
    echo "================"
    
    if [ $total_passed -eq $total_tests ]; then
        echo "✓ All tests passed! Duplicate detection is working accurately."
    else
        echo "⚠ Some tests failed. Consider:"
        echo "  - Adjusting similarity thresholds"
        echo "  - Reviewing false positives/negatives"
        echo "  - Checking pg_trgm configuration"
    fi
}

# Main execution
main() {
    echo -e "${YELLOW}=== Duplicate Detection Validation Tests ===${NC}"
    echo "Running duplicate detection tests at multiple thresholds..."
    
    # Check prerequisites
    check_auth_token
    check_backend
    
    if [ ! -d "$RESULTS_DIR" ]; then
        echo -e "${RED}Error: Results directory not found. Run upload script first.${NC}"
        exit 1
    fi
    
    local total_passed=0
    local total_tests=0
    
    echo
    
    # Test high similarity pairs
    test_file_at_all_thresholds "high_similarity_pairs.md" "high"
    local high_failed=$?
    total_tests=$((total_tests + ${#THRESHOLDS[@]}))
    total_passed=$((total_passed + ${#THRESHOLDS[@]} - high_failed))
    
    echo
    
    # Test medium similarity pairs
    test_file_at_all_thresholds "medium_similarity_pairs.md" "medium"
    local medium_failed=$?
    total_tests=$((total_tests + ${#THRESHOLDS[@]}))
    total_passed=$((total_passed + ${#THRESHOLDS[@]} - medium_failed))
    
    echo
    
    # Test low similarity pairs
    test_file_at_all_thresholds "low_similarity_pairs.md" "low"
    local low_failed=$?
    total_tests=$((total_tests + ${#THRESHOLDS[@]}))
    total_passed=$((total_passed + ${#THRESHOLDS[@]} - low_failed))
    
    echo
    
    # Test unique questions
    test_file_at_all_thresholds "clean_unique_questions.md" "unique"
    local unique_failed=$?
    total_tests=$((total_tests + ${#THRESHOLDS[@]}))
    total_passed=$((total_passed + ${#THRESHOLDS[@]} - unique_failed))
    
    echo
    
    # Test cross-topic duplicates
    test_file_at_all_thresholds "cross_topic_duplicates.md" "cross"
    local cross_failed=$?
    total_tests=$((total_tests + ${#THRESHOLDS[@]}))
    total_passed=$((total_passed + ${#THRESHOLDS[@]} - cross_failed))
    
    echo
    
    # Test edge cases
    test_file_at_all_thresholds "edge_cases.md" "edge"
    local edge_failed=$?
    total_tests=$((total_tests + ${#THRESHOLDS[@]}))
    total_passed=$((total_passed + ${#THRESHOLDS[@]} - edge_failed))
    
    echo
    
    # Generate final report
    generate_test_report "$total_passed" "$total_tests"
    
    # Save report to file
    generate_test_report "$total_passed" "$total_tests" > "$RESULTS_DIR/final_test_report.txt"
    
    # Exit with appropriate code
    if [ $total_passed -eq $total_tests ]; then
        echo -e "${GREEN}All tests passed!${NC}"
        exit 0
    else
        echo -e "${YELLOW}Some tests failed. Check detailed report.${NC}"
        exit 1
    fi
}

# Run main function
main "$@"