#!/bin/bash

# Script to generate nginx configuration from template
# Usage: ./generate-nginx-conf.sh <domain_name> <api_port> <admin_port> <player_port> [output_file]

set -e

# Check if required arguments are provided
if [ "$#" -lt 4 ]; then
    echo "Usage: $0 <domain_name> <api_port> <admin_port> <player_port> [output_file]"
    echo "Example: $0 example.com 3000 3001 3002 /etc/nginx/conf.d/myapp.conf"
    exit 1
fi

DOMAIN_NAME=$1
API_PORT=$2
ADMIN_PORT=$3
PLAYER_PORT=$4
OUTPUT_FILE=${5:-"$1.conf"}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_FILE="$SCRIPT_DIR/nginx-confd.example"

# Check if template exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "Error: Template file not found at $TEMPLATE_FILE"
    exit 1
fi

echo "Generating nginx configuration..."
echo "Domain: $DOMAIN_NAME"
echo "API Port: $API_PORT"
echo "Admin Port: $ADMIN_PORT"
echo "Player Port: $PLAYER_PORT"
echo "Output: $OUTPUT_FILE"
echo ""

# Read template and replace placeholders
sed "s/<DOMAIN_NAME>/$DOMAIN_NAME/g" "$TEMPLATE_FILE" | \
    sed "s/<API_PORT>/$API_PORT/" | \
    sed "s/<ADMIN_PORT>/$ADMIN_PORT/" | \
    sed "s/<PLAYER_PORT>/$PLAYER_PORT/g" > "$OUTPUT_FILE"

echo "✓ Configuration generated successfully at: $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "1. Review the generated configuration: cat $OUTPUT_FILE"
echo "2. Copy to nginx conf.d directory (may require sudo):"
echo "   sudo cp $OUTPUT_FILE /etc/nginx/conf.d/"
echo "3. Test nginx configuration: sudo nginx -t"
echo "4. Register SSL certificate with certbot:"
echo "   sudo certbot --nginx -d $DOMAIN_NAME"
echo "5. Reload nginx: sudo systemctl reload nginx"
