from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    developer = "accountant"
    marketing_manager = "marketing_manager"
    stock_manager = "stock_manager"
    deliveryman = "deliveryman"
    custmer = "custmer"