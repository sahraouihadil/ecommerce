"""
enums.py - User role definitions
==================================
Defines all the roles a user can have in the ARoom platform.
These roles control what pages and API endpoints each user can access.

The roles are stored in the database as an ENUM type, meaning PostgreSQL
will only accept these exact string values in the 'role' column.

IMPORTANT: The string values here (e.g., "marketing manager") must match
exactly what the frontend checks for in login redirects.
"""

from enum import Enum


class UserRole(str, Enum):
    """
    All possible user roles in the system.
    Each role gets access to a different dashboard and set of features.
    """
    admin = "admin"                         # Full platform control, user management
    accountant = "accountant"               # Financial reports and accounting
    marketing_manager = "marketing_manager" # Campaign and promotion management
    stock_manager = "stock_manager"         # Inventory and stock management
    deliveryman = "deliveryman"             # Delivery tracking and management
    customer = "customer"                   # Regular shopping user (default role)
    bot = "bot"                             # AI chatbot (internal use only)
