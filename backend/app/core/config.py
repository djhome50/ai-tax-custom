"""
Application Configuration
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
    
    # Application
    app_name: str = "AI Tax Engine"
    app_version: str = "0.1.0"
    debug: bool = False
    environment: Literal["development", "staging", "production"] = "development"
    
    # API
    api_v1_prefix: str = "/api/v1"
    
    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/ai_tax"
    )
    database_pool_size: int = 5
    database_max_overflow: int = 10
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # Security
    secret_key: str = Field(default="change-me-in-production-with-secure-key")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # AI Providers
    ai_provider: Literal["openai", "anthropic"] = "openai"
    
    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_extraction_model: str = "gpt-4o"
    
    # Anthropic
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-3-haiku-20240307"
    anthropic_extraction_model: str = "claude-3-sonnet-20240229"
    
    # Plaid
    plaid_client_id: str = ""
    plaid_secret: str = ""
    plaid_env: Literal["sandbox", "development", "production"] = "sandbox"
    
    # QuickBooks
    quickbooks_client_id: str = ""
    quickbooks_client_secret: str = ""
    quickbooks_redirect_uri: str = ""
    quickbooks_sandbox: bool = True
    
    # Xero
    xero_client_id: str = ""
    xero_client_secret: str = ""
    xero_redirect_uri: str = ""
    
    # Classification
    classification_confidence_threshold: float = 0.70
    auto_classify_on_import: bool = True
    
    # Tax settings
    default_tax_year: int = 2024
    enable_tax_optimization_alerts: bool = True
    
    # File storage
    upload_dir: str = "./uploads"
    max_upload_size: int = 50 * 1024 * 1024  # 50MB
    
    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
