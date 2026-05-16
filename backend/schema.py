"""
schema.py - Request/Response validation schemas (Pydantic models)
"""

from pydantic import BaseModel, Field, EmailStr, field_validator, validator, model_validator
from enums import UserRole
from fastapi import Form, File
from datetime import datetime, date
from typing import Optional, List


def today():
    return datetime.today().strftime("%Y-%m-%d")


class CreateUserRequest(BaseModel):
    username: str
    password: str
    email: str
    phone_num: str


class LoginUserRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserRoleUpdate(BaseModel):
    name: str


class CreateUser(BaseModel):
    username: str
    email: str
    role: UserRole


class VerifyCode(BaseModel):
    email: str
    code: str


class SetPassword(BaseModel):
    user_name: str
    password: str


class UpdateUser(BaseModel):
    username: str
    email: str
    role: UserRole


class ProfileUpdate(BaseModel):
    username: str | None = None
    email: str | None = None
    avatar_url: str | None = None


# ── Campaigns ──────────────────────────────────────────────────────────────

class CampaignCreate(BaseModel):
    name:          str
    title:         str
    channel:       Optional[str]   = None
    status:        str             = "active"  
    is_active:     bool            = True          
    campaign_type: Optional[str]   = None           # FIX: added ("sale" | "new")
    budget:        float           = 0
    spent:         float           = 0
    impressions:   int             = 0
    clicks:        int             = 0
    start_date:    Optional[date]  = None
    end_date:      Optional[date]  = None
    discount:      Optional[float] = None
    discount_type: Optional[str]   = None          
    code:          Optional[str]   = None
    usage_max:     int             = 0
    usage_current: int             = 0

    @field_validator("status")
    @classmethod
    def status_valid(cls, v):
        allowed = {"active", "draft", "paused", "completed"}
        if v not in allowed:
            raise ValueError(f"status must be one of {sorted(allowed)}")
        return v

    @field_validator("discount_type")
    @classmethod
    def discount_type_valid(cls, v):
        if v is None:
            return v
        allowed = {"percentage", "fixed"}              
        if v not in allowed:
            raise ValueError(f"discount_type must be one of {sorted(allowed)}")
        return v

    @field_validator("discount")
    @classmethod
    def discount_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("discount cannot be negative")
        return v

    @field_validator("code")
    @classmethod
    def code_strip(cls, v):
        if v is not None:
            v = v.strip().upper()
            return v or None
        return v

    @model_validator(mode="after")
    def validate_dates_and_discount(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        if self.discount is not None and self.discount_type == "percentage" and self.discount > 100:
            raise ValueError("percentage discount cannot exceed 100")
        if self.discount is not None and self.discount_type is None:
            raise ValueError("discount_type is required when discount is set")
        if self.usage_max > 0 and self.usage_current > self.usage_max:
            raise ValueError("usage_current cannot exceed usage_max")
        return self


class CampaignUpdate(BaseModel):
    name:          Optional[str]   = None
    title:         Optional[str]   = None
    channel:       Optional[str]   = None
    status:        Optional[str]   = None
    campaign_type: Optional[str]   = None         
    budget:        Optional[float] = None
    spent:         Optional[float] = None
    impressions:   Optional[int]   = None
    clicks:        Optional[int]   = None
    start_date:    Optional[date]  = None
    end_date:      Optional[date]  = None
    discount:      Optional[float] = None
    discount_type: Optional[str]   = None
    code:          Optional[str]   = None
    usage_max:     Optional[int]   = None
    usage_current: Optional[int]   = None

    @field_validator("status")
    @classmethod
    def status_valid(cls, v):
        if v is None:
            return v
        allowed = {"active", "draft", "paused", "completed"}
        if v not in allowed:
            raise ValueError(f"status must be one of {sorted(allowed)}")
        return v

    @field_validator("discount_type")
    @classmethod
    def discount_type_valid(cls, v):
        if v is None:
            return v
        allowed = {"percentage", "fixed"}              
        if v not in allowed:
            raise ValueError(f"discount_type must be one of {sorted(allowed)}")
        return v

    @field_validator("discount")
    @classmethod
    def discount_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("discount cannot be negative")
        return v

    @field_validator("code")
    @classmethod
    def code_strip(cls, v):
        if v is not None:
            v = v.strip().upper()
            return v or None
        return v


# ── Subscribers ─────────────────────────────────────────────────────────────

VALID_Sub_STATUSES = ["subscribed", "unsubscribed"]
VALID_TAGS = ["VIP", "Deals", "New Arrivals", "Sales"]


class NewsletterCreate(BaseModel):
    email: str
    tags:  List[str] = []

    @field_validator("email")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        for tag in v:
            if tag not in VALID_TAGS:
                raise ValueError(f"Invalid tag '{tag}'. Must be one of: {', '.join(VALID_TAGS)}")
        return v


class NewsletterUpdate(BaseModel):
    tags: Optional[List[str]] = None

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is not None:
            for tag in v:
                if tag not in VALID_TAGS:
                    raise ValueError(f"Invalid tag '{tag}'. Must be one of: {', '.join(VALID_TAGS)}")
        return v


# ── Blogs ────────────────────────────────────────────────────────────────────

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
    deliverydate:  date
    delivery_type: str
    wilaya:        str
    city:          str
    streetAddress: str


class PatchDeliveryRequest(BaseModel):
    deliveryman:  Optional[str]  = None
    status:       Optional[str]  = None
    deliverydate: Optional[date] = None


# ── Deliveryman ──────────────────────────────────────────────────────────────

class ProblemReportBody(BaseModel):
    reason: str
    notes:  str = ""


class StatusUpdateBody(BaseModel):
    status: str


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


class OrderOut(BaseModel):
    id:             str
    id_raw:         int
    customer:       str
    address:        str
    eta:            int
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


class TodayStatsOut(BaseModel):
    total:      int
    delivered:  int
    in_transit: int
    pending:    int


class TodayOrdersOut(BaseModel):
    stats:  TodayStatsOut
    orders: List[OrderOut]
    date:   str


class ScheduleDayOut(BaseModel):
    dot:    str
    count:  int
    orders: List[OrderOut]


class ScheduleOut(BaseModel):
    year:     int
    month:    int
    schedule: dict


class HistoryStatsOut(BaseModel):
    total:        int
    delivered:    int
    canceled:     int
    total_earned: float


class HistoryOut(BaseModel):
    stats:  HistoryStatsOut
    orders: List[OrderOut]


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


class StatusUpdateOut(BaseModel):
    message:  str
    order_id: int
    status:   str


class ProblemReportOut(BaseModel):
    order_id:       int
    problem_reason: str
    problem_notes:  str


class ReviewCreate(BaseModel):
    rating:  int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=3, max_length=500)


class ReviewOut(BaseModel):
    id:         int
    product_id: int
    user_name:  str
    rating:     int
    comment:    str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message:      str
    context:      str  = "before_ar"
    product_name: str  = ""
    history:      list = []


class ChatResponse(BaseModel):
    reply: str


class ForgotPasswordRequest(BaseModel):
    username: str
    email:    EmailStr


class VerifyResetCodeRequest(BaseModel):
    email: EmailStr
    code:  str


class ResetPasswordRequest(BaseModel):
    email:        EmailStr
    code:         str
    new_password: str


class ComplaintCreate(BaseModel):
    name:     str
    email:    str
    subject:  str
    message:  str
    priority: Optional[str] = "low"


# ── Validation ───────────────────────────────────────────────────────────────

class ValidationSubmit(BaseModel):
    item_type: str
    item_id:   int
    title:     str

    class Config:
        json_schema_extra = {
            "example": {
                "item_type": "Products",
                "item_id":   42,
                "title":     "Scandinavian Bookshelf Pro"
            }
        }


class RejectionPayload(BaseModel):
    rejection_note: str

    class Config:
        json_schema_extra = {
            "example": {"rejection_note": "Missing dimension specs and weight information."}
        }


class SubmitterOut(BaseModel):
    id:       int
    username: str

    class Config:
        from_attributes = True


class ValidationOut(BaseModel):
    id:             int
    item_type:      str
    item_id:        int
    title:          str
    status:         str
    rejection_note: Optional[str]      = None
    submitted_at:   datetime
    reviewed_at:    Optional[datetime] = None
    submitter:      Optional[SubmitterOut] = None
    reviewer:       Optional[SubmitterOut] = None

    class Config:
        from_attributes = True


class ValidationListItem(BaseModel):
    id:           int
    item_type:    str
    title:        str
    status:       str
    submitted_at: datetime
    user:         Optional[str] = None

    class Config:
        from_attributes = True


class ValidationStats(BaseModel):
    pending:  int
    approved: int
    rejected: int
    total:    int

# ── /add-user — creates the new account after OTP is confirmed ─────
class NewUserRequest(BaseModel):
    email: str
    username: str
    password: str # plain-text; hashed below before storing
    phone_num: str
# ____ / add user in the pending validation table _________________
class CreateUserPending(BaseModel):
    username:  str
    email:     str
    password:  str
    phone_num: Optional[str] = None