"""
schema.py - Request/Response validation schemas (Pydantic models)
==================================================================
Pydantic models define the SHAPE of data that our API accepts and returns.
When the frontend sends a JSON body, FastAPI uses these schemas to:
  1. Validate that all required fields are present
  2. Check that field types are correct (string, int, etc.)
  3. Automatically return a 422 error if validation fails

Think of these as "contracts" between frontend and backend:
  - Frontend says: "I'll send you {username, password, email, phone_num}"
  - Backend says: "OK, I expect exactly those fields in those types"

NAMING CONVENTION:
  - "Request" suffix = data coming FROM the frontend
  - No suffix = data going TO the frontend or used internally
"""

from pydantic import BaseModel
from enums import UserRole


class CreateUserRequest(BaseModel):
    """
    Data required to register a new customer account.
    Sent by: SignupPage.jsx → POST /register
    """
    username: str      # Display name (must be unique)
    password: str      # Plain text password (will be hashed before storing)
    email: str         # Email address (must be unique, used for verification)
    phone_num: str      # Phone number


class LoginUserRequest(BaseModel):
    """
    Data required to log in.
    Sent by: LoginPage.jsx → POST /login
    Note: The actual login uses OAuth2PasswordRequestForm, not this schema.
    """
    username: str
    password: str


class Token(BaseModel):
    """
    The response returned after successful login or registration.
    Contains the JWT access token the frontend stores in localStorage.
    """
    access_token: str   # The JWT token string
    token_type: str     # Always "bearer"


class UserRoleUpdate(BaseModel):
    """
    Data required to change a user's role.
    Sent by: Admin dashboard → PUT /setrole
    """
    name: str           # The new role name (e.g., "admin", "customer")


class CreateUser(BaseModel):
    """
    Data required for an ADMIN to create a new user.
    Unlike CreateUserRequest, this doesn't include a password because
    admin-created users set their password later via email verification.
    Sent by: AccountsPage.jsx → POST /api/users
    """
    username: str
    email: str
    role: UserRole      # The role to assign (uses the UserRole enum)


class VerifyCode(BaseModel):
    """
    Data for email verification.
    Sent by: VerifyCode.jsx → GET /verify-code
    """
    email: str
    code: str


class SetPassword(BaseModel):
    """
    Data for setting a password after email verification.
    Sent by: SetPassword.jsx → POST /set-password
    """
    user_name: str      # The username (received from verify-code response)
    password: str       # The new password (will be validated and hashed)


class UpdateUser(BaseModel):
    """
    Data for updating an existing user's info.
    Sent by: AccountsPage.jsx → PUT /api/users/{user_id}
    """
    username: str
    email: str
    role: UserRole
