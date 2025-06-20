"""
@file backend/app/services/__init__.py
@description Central export point for all service modules
@created June 20, 2025. 10:03 AM Eastern Time
@updated June 20, 2025. 10:03 AM Eastern Time - Added staging service export

@architectural-context
Layer: Service (Business Logic)
Dependencies: All service modules
Pattern: Single import point for service layer

@workflow-context
User Journey: All business logic operations
Sequence Position: Imported by routers for business logic
Inputs: N/A (export module)
Outputs: Service classes and instances

@authentication-context
Auth Requirements: N/A (handled by individual services)
Security: Services enforce their own security requirements

@database-context
Tables: Services interact with various database tables
Operations: N/A (export module)
Transactions: Handled by individual services
"""

from .auth_service import auth_service
from .question_service import question_service
from .analytics_service import analytics_service
from .duplicate_service import duplicate_service
from .validation_service import validation_service
from .staging_service import StagingService

__all__ = [
    "auth_service",
    "question_service", 
    "analytics_service",
    "duplicate_service",
    "validation_service",
    "StagingService"
]