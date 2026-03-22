# Authentication models
from pydantic import BaseModel
from typing import Optional

# JWT token response model
class Token(BaseModel):
    access_token: str
    token_type: str

# Token data payload model
class TokenData(BaseModel):
    email: Optional[str] = None