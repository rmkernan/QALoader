#!/bin/bash

# Main Test Runner for Duplicate Detection System
# Created: June 19, 2025. 6:30 PM Eastern Time
# Purpose: Execute complete test suite for duplicate detection accuracy

set -e

# Source configuration
source ./config.sh

# Function to show usage
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help           Show this help message"
    echo "  -u, --upload-only    Only upload test data"
    echo "  -v, --validate-only  Only run validation tests"
    echo "  -c, --cleanup-only   Only cleanup test data"
    echo "  --skip-cleanup       Skip cleanup after tests"
    echo "  --keep-data         Keep test data after completion"
    echo ""
    echo "Environment Variables:"
    echo "  JWT_TOKEN           Required JWT authentication token"
    echo ""
    echo "Prerequisites:"
    echo "  - Backend server running on localhost:8000"
    echo "  - pg_trgm extension enabled in database"
    echo "  - Valid JWT token set in environment"
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}Checking prerequisites...${NC}"
    
    # Check required commands
    for cmd in curl jq bc; do
        if ! command -v "$cmd" &> /dev/null; then
            echo -e "${RED}Error: Required command '$cmd' not found${NC}"
            echo "Please install: $cmd"
            exit 1
        fi
    done
    
    check_auth_token
    check_backend
    
    echo -e "${GREEN}✓ All prerequisites met${NC}"
}

# Function to run pre-test setup
pre_test_setup() {
    echo -e "${BLUE}Setting up test environment...${NC}"
    
    setup_results_dir
    
    # Log test configuration
    echo "Test Configuration:" > "$RESULTS_DIR/test_config.txt"
    echo "=================" >> "$RESULTS_DIR/test_config.txt"
    echo "Base URL: $BASE_URL" >> "$RESULTS_DIR/test_config.txt"
    echo "Test Data Directory: $TEST_DATA_DIR" >> "$RESULTS_DIR/test_config.txt"
    echo "Results Directory: $RESULTS_DIR" >> "$RESULTS_DIR/test_config.txt"
    echo "Thresholds: ${THRESHOLDS[*]}" >> "$RESULTS_DIR/test_config.txt"
    echo "Test Files: ${!TEST_FILES[*]}" >> "$RESULTS_DIR/test_config.txt"
    echo "Timestamp: $(date)" >> "$RESULTS_DIR/test_config.txt"
    
    echo -e "${GREEN}✓ Test environment ready${NC}"
}

# Function to run upload phase
run_upload_phase() {
    echo -e "${YELLOW}=== Phase 1: Upload Test Data ===${NC}"
    
    if ! ./upload_test_data.sh; then
        echo -e "${RED}Upload phase failed. Cannot continue with validation.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Upload phase completed successfully${NC}"
}

# Function to run validation phase  
run_validation_phase() {
    echo -e "${YELLOW}=== Phase 2: Validate Duplicate Detection ===${NC}"
    
    if ! ./validate_duplicates.sh; then
        echo -e "${YELLOW}⚠ Some validation tests failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✓ Validation phase completed successfully${NC}"
    return 0
}

# Function to run cleanup phase
run_cleanup_phase() {
    echo -e "${YELLOW}=== Phase 3: Cleanup Test Data ===${NC}"
    
    if ! ./cleanup_test_data.sh; then
        echo -e "${YELLOW}⚠ Some cleanup operations failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✓ Cleanup phase completed successfully${NC}"
    return 0
}

# Function to generate final summary
generate_final_summary() {
    local validation_success="$1"
    local cleanup_success="$2"
    
    echo -e "${YELLOW}=== Final Test Summary ===${NC}"
    echo "Test execution completed: $(date)"
    echo
    
    if [ -f "$RESULTS_DIR/final_test_report.txt" ]; then
        echo "Validation Results:"
        echo "=================="
        grep -E "(Total tests|Passed|Failed|Success rate)" "$RESULTS_DIR/final_test_report.txt"
        echo
    fi
    
    echo "Phase Results:"
    echo "=============="
    echo "Upload Phase: ✓ Success"
    
    if [ "$validation_success" -eq 0 ]; then
        echo "Validation Phase: ✓ Success"
    else
        echo "Validation Phase: ✗ Some tests failed"
    fi
    
    if [ "$cleanup_success" -eq 0 ]; then
        echo "Cleanup Phase: ✓ Success"
    else
        echo "Cleanup Phase: ✗ Some operations failed"
    fi
    
    echo
    echo "Results Location: $RESULTS_DIR"
    
    if [ -f "$RESULTS_DIR/final_test_report.txt" ]; then
        echo "Detailed Report: $RESULTS_DIR/final_test_report.txt"
    fi
}

# Main execution
main() {
    local upload_only=false
    local validate_only=false
    local cleanup_only=false
    local skip_cleanup=false
    local keep_data=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -u|--upload-only)
                upload_only=true
                shift
                ;;
            -v|--validate-only)
                validate_only=true
                shift
                ;;
            -c|--cleanup-only)
                cleanup_only=true
                shift
                ;;
            --skip-cleanup)
                skip_cleanup=true
                shift
                ;;
            --keep-data)
                keep_data=true
                shift
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                show_usage
                exit 1
                ;;
        esac
    done
    
    echo -e "${YELLOW}=== Duplicate Detection Test Suite ===${NC}"
    echo "Starting comprehensive test execution..."
    echo
    
    # Check prerequisites
    check_prerequisites
    echo
    
    # Setup test environment
    pre_test_setup  
    echo
    
    local validation_success=0
    local cleanup_success=0
    
    # Execute phases based on options
    if [ "$cleanup_only" = true ]; then
        run_cleanup_phase
        cleanup_success=$?
    elif [ "$validate_only" = true ]; then
        run_validation_phase
        validation_success=$?
    elif [ "$upload_only" = true ]; then
        run_upload_phase
    else
        # Full test execution
        run_upload_phase
        echo
        
        run_validation_phase
        validation_success=$?
        echo
        
        if [ "$skip_cleanup" != true ] && [ "$keep_data" != true ]; then
            run_cleanup_phase
            cleanup_success=$?
            echo
        elif [ "$keep_data" = true ]; then
            echo -e "${YELLOW}Keeping test data as requested${NC}"
            echo
        fi
    fi
    
    # Generate summary
    generate_final_summary "$validation_success" "$cleanup_success"
    
    # Exit with appropriate code
    if [ "$validation_success" -eq 0 ]; then
        echo -e "${GREEN}Test suite completed successfully!${NC}"
        exit 0
    else
        echo -e "${YELLOW}Test suite completed with some failures${NC}"
        exit 1
    fi
}

# Run main function
main "$@"