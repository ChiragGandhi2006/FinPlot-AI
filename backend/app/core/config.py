from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    DATABASE_URL: str

    SECRET_KEY: str

    ALGORITHM: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int

    AI_OPENAI_API_KEY: str = ""

    AI_MODEL: str = ""

    AI_BASE_URL: str = "https://api.openai.com/v1"
    SYNC_PASSWORD: str = "finpilot-sync-default-change-me"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()