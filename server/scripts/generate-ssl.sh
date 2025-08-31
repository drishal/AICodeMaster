#!/bin/bash

# SSL Certificate Generation Script for MO Development Environment
# This script generates self-signed SSL certificates for local development

set -e

SSL_DIR="ssl"
DHPARAM_SIZE=2048

echo "🔐 Generating SSL certificates for MO Development Environment"
echo "=========================================================="

# Create SSL directory if it doesn't exist
mkdir -p $SSL_DIR

# Generate private key
echo "📝 Generating private key..."
openssl genrsa -out $SSL_DIR/key.pem 4096

# Generate certificate signing request
echo "📋 Generating certificate signing request..."
openssl req -new -key $SSL_DIR/key.pem -out $SSL_DIR/csr.pem -subj "/C=US/ST=Local/L=Development/O=MO Development/OU=IT Department/CN=localhost"

# Generate self-signed certificate
echo "📜 Generating self-signed certificate..."
openssl x509 -req -days 365 -in $SSL_DIR/csr.pem -signkey $SSL_DIR/key.pem -out $SSL_DIR/cert.pem

# Generate DH parameters for stronger security
echo "🔒 Generating Diffie-Hellman parameters (this may take a while)..."
openssl dhparam -out $SSL_DIR/dhparam.pem $DHPARAM_SIZE

# Set appropriate permissions
chmod 600 $SSL_DIR/key.pem
chmod 644 $SSL_DIR/cert.pem
chmod 644 $SSL_DIR/dhparam.pem

# Clean up CSR file
rm $SSL_DIR/csr.pem

echo ""
echo "✅ SSL certificates generated successfully!"
echo "📁 Certificates location: $SSL_DIR/"
echo "🔑 Private key: $SSL_DIR/key.pem"
echo "📜 Certificate: $SSL_DIR/cert.pem"
echo "🔒 DH Params: $SSL_DIR/dhparam.pem"
echo ""
echo "⚠️  Note: These are self-signed certificates for development use only."
echo "🌐 For production, obtain certificates from a trusted CA like Let's Encrypt."
echo ""
echo "🚀 You can now start your MO Development Environment with HTTPS support!"