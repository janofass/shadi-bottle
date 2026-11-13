import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum  # 1. Import Mangum

from app.services.gemini import (
    GeminiNotConfigured,
    SleeveConcept,
    SleeveDetails,
    generate_concept,
)

logger = logging.getLogger(__name__)

# If running on Lambda/API Gateway, root_path includes the stage
# Or you can set it dynamically or via environment variable if needed
app = FastAPI(
    title="Shadi Bottle API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    root_path="/Prod"  # <--- Add this line here
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any browser/domain to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/generate-sleeve", response_model=SleeveConcept)
def generate_sleeve(details: SleeveDetails) -> SleeveConcept:
    try:
        return generate_concept(details)
    except GeminiNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Sleeve concept generation failed")
        raise HTTPException(status_code=502, detail="Concept generation failed") from exc

# 2. Define the handler for AWS Lambda
handler = Mangum(app)