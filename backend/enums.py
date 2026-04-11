from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    accountant = "accountant"
    marketing_manager = "marketing manager"
    stock_manager = "stock manager"
    deliveryman = "deliveryman"
    customer = "customer"
    bot = "bot"