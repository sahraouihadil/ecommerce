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

from pydantic import BaseModel,Field,EmailStr, field_validator,validator
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

VALID_CHANNELS = [
    "Email",
    "Facebook",
    "Instagram",
    "TikTok",
    "YouTube",
    "Twitter / X",
    "LinkedIn",
    "Snapchat",
    "Pinterest",
    "WhatsApp",
    "Telegram",
    "AR",
    "Search",
    "Display",
]

VALID_Cam_STATUSES = ["active", "draft", "paused", "completed"]

class CampaignCreate(BaseModel):
    name:        str
    channel:     str
    status:      str        = "draft"
    budget:      float      = 0.0
    spent:       float      = 0.0
    impressions: int        = 0
    clicks:      int        = 0
    start_date:  date
    end_date:    date

    @field_validator("channel")
    @classmethod
    def validate_channel(cls, v):
        if v not in VALID_CHANNELS:
            raise ValueError(f"Invalid channel '{v}'. Must be one of: {', '.join(VALID_CHANNELS)}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v not in VALID_Cam_STATUSES:
            raise ValueError(f"Invalid status '{v}'. Must be one of: {', '.join(VALID_Cam_STATUSES)}")
        return v

    @field_validator("end_date")
    @classmethod
    def end_after_start(cls, v, info):
        start = info.data.get("start_date")
        if start and v < start:
            raise ValueError("end_date must be on or after start_date")
        return v


class CampaignUpdate(BaseModel):
    name:        Optional[str]   = None
    channel:     Optional[str]   = None
    status:      Optional[str]   = None
    budget:      Optional[float] = None
    spent:       Optional[float] = None
    impressions: Optional[int]   = None
    clicks:      Optional[int]   = None
    start_date:  Optional[date]  = None
    end_date:    Optional[date]  = None

    @field_validator("channel")
    @classmethod
    def validate_channel(cls, v):
        if v is not None and v not in VALID_CHANNELS:
            raise ValueError(f"Invalid channel '{v}'. Must be one of: {', '.join(VALID_CHANNELS)}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v is not None and v not in VALID_Cam_STATUSES:
            raise ValueError(f"Invalid status '{v}'. Must be one of: {', '.join(VALID_Cam_STATUSES)}")
        return v


# ── Promotions ──────────────────────────────
VALID_TYPES    = ["Percentage", "Fixed"]
VALID_Prom_STATUSES = ["active", "upcoming", "expired"]

class PromotionCreate(BaseModel):
    title:         str
    code:          str
    discount:      float       = 0.0
    discount_type: str         = "Percentage"
    usage_max:     int         = 0
    usage_current: int         = 0
    expiry:        date
    status:        str         = "upcoming"

    @field_validator("code")
    @classmethod
    def uppercase_code(cls, v):
        return v.strip().upper()

    @field_validator("discount_type")
    @classmethod
    def validate_type(cls, v):
        if v not in VALID_TYPES:
            raise ValueError(f"discount_type must be one of: {', '.join(VALID_TYPES)}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v not in VALID_Prom_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(VALID_Prom_STATUSES)}")
        return v

    @field_validator("discount")
    @classmethod
    def validate_discount(cls, v):
        if v < 0:
            raise ValueError("discount must be >= 0")
        return v


class PromotionUpdate(BaseModel):
    title:         Optional[str]   = None
    code:          Optional[str]   = None
    discount:      Optional[float] = None
    discount_type: Optional[str]   = None
    usage_max:     Optional[int]   = None
    usage_current: Optional[int]   = None
    expiry:        Optional[date]  = None
    status:        Optional[str]   = None

    @field_validator("code")
    @classmethod
    def uppercase_code(cls, v):
        return v.strip().upper() if v else v

    @field_validator("discount_type")
    @classmethod
    def validate_type(cls, v):
        if v is not None and v not in VALID_TYPES:
            raise ValueError(f"discount_type must be one of: {', '.join(VALID_TYPES)}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v is not None and v not in VALID_Prom_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(VALID_Prom_STATUSES)}")
        return v
# ── Subscribers ─────────────────────────────
 
VALID_Sub_STATUSES = ["subscribed", "unsubscribed"]
VALID_TAGS     = ["VIP", "Deals", "New Arrivals", "Sales"]
 
class NewsletterCreate(BaseModel):
    name:   str
    email:  str
    status: str       = "subscribed"
    tags:   List[str] = []
 
    @field_validator("email")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        return v.strip().lower()
 
    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_Sub_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(VALID_Sub_STATUSES)}")
        return v
 
    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        for tag in v:
            if tag not in VALID_TAGS:
                raise ValueError(f"Invalid tag '{tag}'. Must be one of: {', '.join(VALID_TAGS)}")
        return v
 
 
class NewsletterUpdate(BaseModel):
    name:   Optional[str]       = None
    email:  Optional[str]       = None
    status: Optional[str]       = None
    tags:   Optional[List[str]] = None
 
    @field_validator("email")
    @classmethod
    def normalise_email(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().lower() if v else v
 
    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_Sub_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(VALID_Sub_STATUSES)}")
        return v
 
    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is not None:
            for tag in v:
                if tag not in VALID_TAGS:
                    raise ValueError(f"Invalid tag '{tag}'. Must be one of: {', '.join(VALID_TAGS)}")
        return v
 
# ── Blogs ────────────────────────────────────

class BlogCreate(BaseModel):
    title:    str
    excerpt:  str
    category: str
    status:   str
    author:   str
    image:    Optional[str] = None
    tag:      Optional[str] = None
    content:  Optional[str] = None


class BlogUpdate(BaseModel):
    title:    Optional[str] = None
    excerpt:  Optional[str] = None
    category: Optional[str] = None
    status:   Optional[str] = None
    author:   Optional[str] = None
    image:    Optional[str] = None
    tag:      Optional[str] = None
    content:  Optional[str] = None
    
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