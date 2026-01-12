#!/bin/bash
set -e

# ==================================================================================
# Configuration
# ==================================================================================
# You can set these environment variables before running the script,
# or the script will prompt you for them.
PROJECT_ID="${PROJECT_ID}"
REGION="${REGION:-asia-northeast1}" # Default to Tokyo, change if needed
APP_NAME="${APP_NAME:-livev2-app}"
BUCKET_NAME="${BUCKET_NAME}"

# Font colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Google Cloud Run Deployment Script with Data Persistence ===${NC}"

# Check for gcloud
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# ==================================================================================
# 1. Setup Variables
# ==================================================================================

# 1.1 Project ID
if [ -z "$PROJECT_ID" ]; then
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
    echo -n "Enter Google Cloud Project ID [Default: $CURRENT_PROJECT]: "
    read -r INPUT_PROJECT_ID
    PROJECT_ID="${INPUT_PROJECT_ID:-$CURRENT_PROJECT}"
fi

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: Project ID is required.${NC}"
    exit 1
fi

echo -e "Using Project ID: ${GREEN}$PROJECT_ID${NC}"
gcloud config set project "$PROJECT_ID"

# 1.2 Enable APIs
echo "Enabling necessary APIs (artifactregistry, run, storage, cloudbuild)..."
gcloud services enable artifactregistry.googleapis.com run.googleapis.com storage.googleapis.com cloudbuild.googleapis.com

# 1.3 Bucket Name
if [ -z "$BUCKET_NAME" ]; then
    DEFAULT_BUCKET="${PROJECT_ID}-livev2-data"
    echo -n "Enter GCS Bucket Name for persistence [Default: $DEFAULT_BUCKET]: "
    read -r INPUT_BUCKET_NAME
    BUCKET_NAME="${INPUT_BUCKET_NAME:-$DEFAULT_BUCKET}"
fi
echo -e "Using Bucket: ${GREEN}$BUCKET_NAME${NC}"

# ==================================================================================
# 2. Persistence Setup (Google Cloud Storage)
# ==================================================================================
echo -e "${GREEN}=== Checking/Creating Storage Bucket ===${NC}"

if ! gcloud storage buckets describe "gs://$BUCKET_NAME" &>/dev/null; then
    echo "Creating bucket gs://$BUCKET_NAME in $REGION..."
    gcloud storage buckets create "gs://$BUCKET_NAME" --location="$REGION"
else
    echo "Bucket gs://$BUCKET_NAME already exists."
fi

# 2.1 Migrate Local Data
LOCAL_DATA_FILE="server/data/prd-notes.json"
REMOTE_DATA_PATH="gs://$BUCKET_NAME/prd-notes.json"

if [ -f "$LOCAL_DATA_FILE" ]; then
    echo "Found local data at $LOCAL_DATA_FILE."
    echo "Checking if data exists in the bucket..."
    
    if ! gcloud storage ls "$REMOTE_DATA_PATH" &>/dev/null; then
        echo "Uploading initial data to bucket..."
        gcloud storage cp "$LOCAL_DATA_FILE" "$REMOTE_DATA_PATH"
        echo "Data uploaded."
    else
        echo -e "${RED}Warning: Remote data already exists at $REMOTE_DATA_PATH.${NC}"
        echo -n "Do you want to OVERWRITE it with local data? (y/N): "
        read -r OVERWRITE_CHOICE
        if [[ "$OVERWRITE_CHOICE" =~ ^[Yy]$ ]]; then
            gcloud storage cp "$LOCAL_DATA_FILE" "$REMOTE_DATA_PATH"
            echo "Remote data overwritten."
        else
            echo "Skipping upload. Using existing remote data."
        fi
    fi
else
    echo "No local data found at $LOCAL_DATA_FILE. Creating empty data in bucket if not exists."
    # Optional: create empty file if needed, but app should handle missing file.
fi

# ==================================================================================
# 3. Build & Deploy
# ==================================================================================
echo -e "${GREEN}=== Building and Deploying to Cloud Run ===${NC}"

# Using Google Cloud Build to build the image and store in Artifact Registry (or Container Registry)
# We will use the default gcr.io for simplicity or allow Cloud Run to build from source if supported,
# but 'gcloud builds submit' is standard.

IMAGE_NAME="gcr.io/$PROJECT_ID/$APP_NAME"

echo "Building container image: $IMAGE_NAME"
gcloud builds submit --tag "$IMAGE_NAME" .

echo "Deploying to Cloud Run..."
# Note: --add-volume and --add-volume-mount are for Gen 2 execution environment
gcloud run deploy "$APP_NAME" \
    --image "$IMAGE_NAME" \
    --region "$REGION" \
    --platform managed \
    --execution-environment gen2 \
    --allow-unauthenticated \
    --add-volume=name=data-volume,type=cloud-storage,bucket="$BUCKET_NAME" \
    --add-volume-mount=volume=data-volume,mount-path=/app/server/data

echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo "Your app should now be live. Data in '/app/server/data' is persisted to 'gs://$BUCKET_NAME'."
