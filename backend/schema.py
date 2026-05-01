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

from pydantic import BaseModel,Field,EmailStr
from enums import UserRole
from fastapi import Form,File
from datetime import datetime,date
from typing import Optional, List


def today():
    return datetime.today().strftime("%Y-%m-%d")


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

class ProfileUpdate(BaseModel):
    username: str | None = None
    email: str | None = None
    avatar_url: str | None = None


# ── Campaigns ───────────────────────────────

class CampaignCreate(BaseModel):
    name:        str
    channel:     str
    status:      str   = "draft"
    budget:      float = 0
    spent:       float = 0
    impressions: str   = "0"
    clicks:      str   = "0"
    start_date:  str
    end_date:    str

class Campaign(CampaignCreate):
    id: int

class CampaignUpdate(BaseModel):
    name:        Optional[str]   = None
    channel:     Optional[str]   = None
    status:      Optional[str]   = None
    budget:      Optional[float] = None
    spent:       Optional[float] = None
    impressions: Optional[str]   = None
    clicks:      Optional[str]   = None
    start_date:  Optional[str]   = None
    end_date:    Optional[str]   = None

# ── Promotions ──────────────────────────────

class PromotionCreate(BaseModel):
    title:         str
    code:          str
    discount:      str
    type:          str
    usage:         str = "0/0"
    usage_max:     int = 0
    usage_current: int = 0
    expiry:        str
    status:        str = "upcoming"

class PromotionUpdate(BaseModel):
    title:         Optional[str] = None
    code:          Optional[str] = None
    discount:      Optional[str] = None
    type:          Optional[str] = None
    usage:         Optional[str] = None
    usage_max:     Optional[int] = None
    usage_current: Optional[int] = None
    expiry:        Optional[str] = None
    status:        Optional[str] = None

# ── Subscribers ─────────────────────────────

class NewsletterCreate(BaseModel):
    name:   str
    email:  str
    status: str       = "subscribed"
    tags:   List[str] = []
    date:   str       = Field(default_factory=today)

class NewsletterUpdate(BaseModel):
    name:   Optional[str]       = None
    email:  Optional[str]       = None
    status: Optional[str]       = None
    tags:   Optional[List[str]] = None

# ── Blogs ────────────────────────────────────

class BlogCreate(BaseModel):
    title:    str
    category: str
    excerpt:  str
    author:   str
    views:    str = "0"
    status:   str = "draft"
    date:     str = Field(default_factory=today)

class Blog(BlogCreate):
    id: int

class BlogUpdate(BaseModel):
    title:    Optional[str] = None
    category: Optional[str] = None
    excerpt:  Optional[str] = None
    author:   Optional[str] = None
    views:    Optional[str] = None
    status:   Optional[str] = None
    date:     Optional[str] = None

class OrderCreate(BaseModel):
    deliverydate: date
    delivery_type :  str
    wilaya: str
    city: str
    streetAddress: str


class PatchDeliveryRequest(BaseModel):
    deliveryman: Optional[str] = None 
    status: Optional[str] = None
    deliverydate: Optional[date] = None 

# ── Deliveryman ───────────────────────────────────────────────────────────────
 
class ProblemReportBody(BaseModel):
    reason: str
    notes:  str = ""
 
 
class StatusUpdateBody(BaseModel):
    status: str
 
 
# ── Order item (nested inside order response) ─────────────────────────────────
 
class OrderItemOut(BaseModel):
    id:           int
    product_id:   int
    product_name: str
    image:        Optional[str]
    price:        float
    quantity:     int
    status:       str
 
    class Config:
        from_attributes = True
 
 
# ── Order response ────────────────────────────────────────────────────────────
 
class OrderOut(BaseModel):
    id:             str          # "ORD-001"
    id_raw:         int
    customer:       str
    address:        str
    eta:            int          # minutes remaining (0 if not pending)
    km:             float
    amount:         float
    status:         str
    date:           Optional[str]
    rating:         Optional[float]
    problem_reason: Optional[str]
    problem_notes:  Optional[str]
    items:          List[OrderItemOut]
 
    class Config:
        from_attributes = True
 
 
# ── Stats (embedded in today / schedule responses) ────────────────────────────
 
class TodayStatsOut(BaseModel):
    total:      int
    delivered:  int
    in_transit: int
    pending:    int
 
 
class TodayOrdersOut(BaseModel):
    stats:  TodayStatsOut
    orders: List[OrderOut]
    date:   str
 
 
# ── Schedule ──────────────────────────────────────────────────────────────────
 
class ScheduleDayOut(BaseModel):
    dot:    str          # "pending" | "delivered" | "problem"
    count:  int
    orders: List[OrderOut]
 
 
class ScheduleOut(BaseModel):
    year:     int
    month:    int
    schedule: dict       # date string → ScheduleDayOut
 
 
# ── History stats ─────────────────────────────────────────────────────────────
 
class HistoryStatsOut(BaseModel):
    total:        int
    delivered:    int
    canceled:       int
    total_earned: float
 
 
class HistoryOut(BaseModel):
    stats:  HistoryStatsOut
    orders: List[OrderOut]
 
 
# ── Profile ───────────────────────────────────────────────────────────────────
 
class ProfileStatsOut(BaseModel):
    total_orders: int
    delivered:    int
    issues:       int
    total_earned: float
 
 
class ProfileOut(BaseModel):
    id:           int
    name:         str
    phone:        Optional[str]
    vehicle:      Optional[str]
    member_since: Optional[str]
    avg_rating:   Optional[float]
    stats:        ProfileStatsOut
 
 
# ── Status update response ────────────────────────────────────────────────────
 
class StatusUpdateOut(BaseModel):
    message:  str
    order_id: int
    status:   str

# ── Problem report response ───────────────────────────────────────────────────
 
class ProblemReportOut(BaseModel):
    order_id:       int
    problem_reason: str
    problem_notes:  str

# ── Pydantic schemas ──────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=3, max_length=500)


class ReviewOut(BaseModel):
    id: int
    product_id: int
    user_name: str
    rating: int
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    """
    The data sent by the frontend when the user sends a chat message.
    """
    message: str              # The user's message text
    context: str = "before_ar"  # Shopping context (before_ar, during_ar, after_ar)
    product_name: str = ""    # Name of the product being viewed (if any)
    history: list = []        # Previous messages in the conversation


class ChatResponse(BaseModel):
    """The AI's reply sent back to the frontend."""
    reply: str

# forget password _______________________________________________
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyResetCodeRequest(BaseModel):
    email: EmailStr
    code: str           # 6-digit string sent to the user's email


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str           # re-validated to prevent skipping step 2
    new_password: str

