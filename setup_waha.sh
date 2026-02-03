#!/bin/bash

WAHA_API_KEY="5986b1529d064ef9a21d36c5a6579498"
WAHA_URL="http://localhost:3001"
WEBHOOK_URL="http://host.docker.internal:3000/api/webhook/whatsapp"

echo "1. Stopping session 'default'..."
curl -s -X POST "$WAHA_URL/api/sessions/default/stop" \
  -H "X-Api-Key: $WAHA_API_KEY"

echo -e "\n2. Deleting session 'default' from memory..."
curl -s -X DELETE "$WAHA_URL/api/sessions/default" \
  -H "X-Api-Key: $WAHA_API_KEY"

echo -e "\n3. Recreating session 'default' with Webhook: $WEBHOOK_URL"
curl -s -X POST "$WAHA_URL/api/sessions" \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: $WAHA_API_KEY" \
  -d '{
    "name": "default",
    "config": {
        "webhookUrl": "'"$WEBHOOK_URL"'"
    }
  }'

echo -e "\nDone."
