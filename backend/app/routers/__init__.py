"""
@file backend/app/routers/__init__.py
@description Central export point for all API routers
@created June 20, 2025. 10:06 AM Eastern Time
@updated June 20, 2025. 10:06 AM Eastern Time - Added staging router export

@architectural-context
Layer: API Route Layer
Dependencies: All router modules
Pattern: Single import point for routers

@workflow-context
User Journey: All API endpoints
Sequence Position: Imported by main.py for route registration
Inputs: N/A (export module)
Outputs: Router instances for FastAPI

@authentication-context
Auth Requirements: N/A (handled by individual routers)
Security: Each router enforces its own auth requirements

@database-context
Tables: Routers interact with various database tables
Operations: N/A (export module)
Transactions: Handled by individual routers
"""

# Router package initialization
