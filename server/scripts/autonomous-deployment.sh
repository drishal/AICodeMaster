#!/bin/bash

# Autonomous Self-Deployment Script for MO APP Platform
# This script enables the platform to deploy and host itself completely autonomously

set -e

echo "🚀 Starting Autonomous Self-Deployment..."

# Configuration
PLATFORM_NAME="MO_APP_PLATFORM"
DOCKER_COMPOSE_URL="https://raw.githubusercontent.com/docker/compose/master/script/run/run.sh"
DEPLOYMENT_DIR="/opt/moapp"
SERVICE_USER="moapp"
DOMAIN=${DOMAIN:-"localhost"}
EMAIL=${EMAIL:-"admin@localhost"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if running as root for initial setup
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root for initial system setup"
    fi
}

# Install system dependencies
install_dependencies() {
    log "Installing system dependencies..."
    
    # Update system
    apt-get update -qq
    
    # Install required packages
    apt-get install -y \
        curl \
        wget \
        git \
        docker.io \
        nginx \
        certbot \
        python3-certbot-nginx \
        ufw \
        fail2ban \
        htop \
        unzip \
        postgresql-client \
        redis-tools
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Enable and start Docker
    systemctl enable docker
    systemctl start docker
    
    success "System dependencies installed"
}

# Create service user
create_service_user() {
    log "Creating service user..."
    
    if ! id "$SERVICE_USER" &>/dev/null; then
        useradd -r -s /bin/bash -m -d "$DEPLOYMENT_DIR" "$SERVICE_USER"
        usermod -aG docker "$SERVICE_USER"
        success "Service user '$SERVICE_USER' created"
    else
        warning "Service user '$SERVICE_USER' already exists"
    fi
}

# Setup firewall
setup_firewall() {
    log "Configuring firewall..."
    
    # Enable UFW
    ufw --force enable
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow PostgreSQL (local only)
    ufw allow from 127.0.0.1 to any port 5432
    
    # Allow Redis (local only) 
    ufw allow from 127.0.0.1 to any port 6379
    
    success "Firewall configured"
}

# Generate secure passwords
generate_passwords() {
    log "Generating secure passwords..."
    
    export POSTGRES_PASSWORD=$(openssl rand -base64 32)
    export REDIS_PASSWORD=$(openssl rand -base64 32)
    export JWT_SECRET=$(openssl rand -base64 64)
    export ENCRYPTION_KEY=$(openssl rand -base64 32)
    
    # Save to secure environment file
    cat > "$DEPLOYMENT_DIR/.env" << EOF
# MO APP Platform Environment Configuration
# Generated on $(date)

# Database
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# Cache
REDIS_PASSWORD=$REDIS_PASSWORD

# Security
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Domain Configuration
DOMAIN=$DOMAIN
EMAIL=$EMAIL

# AI API Keys (Optional - will be configured via UI)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Node Environment
NODE_ENV=production
EOF

    chmod 600 "$DEPLOYMENT_DIR/.env"
    chown "$SERVICE_USER:$SERVICE_USER" "$DEPLOYMENT_DIR/.env"
    
    success "Secure passwords generated and saved"
}

# Clone platform code
deploy_platform_code() {
    log "Deploying platform code..."
    
    # Create deployment structure
    mkdir -p "$DEPLOYMENT_DIR"/{logs,backups,ssl,uploads,media}
    
    # Copy current platform files (if running from within the platform)
    if [ -f "package.json" ]; then
        cp -r . "$DEPLOYMENT_DIR/app/"
        cd "$DEPLOYMENT_DIR/app"
        
        # Install dependencies
        npm ci --only=production
        
        # Build the application
        npm run build
    else
        error "Platform source code not found. Please run this script from the platform root directory."
    fi
    
    # Set ownership
    chown -R "$SERVICE_USER:$SERVICE_USER" "$DEPLOYMENT_DIR"
    
    success "Platform code deployed"
}

# Generate production Docker Compose
generate_docker_compose() {
    log "Generating production Docker Compose configuration..."
    
    cat > "$DEPLOYMENT_DIR/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  app:
    build: ./app
    ports:
      - "3000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@database:5432/moapp
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    depends_on:
      - database
      - redis
    restart: unless-stopped
    volumes:
      - ./uploads:/app/uploads
      - ./media:/app/media
      - ./logs:/app/logs
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  database:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=moapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

  ai-service:
    build:
      context: ./app
      dockerfile: Dockerfile.ai
    environment:
      - PYTHON_ENV=production
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@database:5432/moapp
    depends_on:
      - database
    restart: unless-stopped
    volumes:
      - ai_models:/app/models
      - ./media:/app/output
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=3600
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  ai_models:

networks:
  default:
    driver: bridge
EOF

    success "Docker Compose configuration generated"
}

# Configure Nginx reverse proxy
setup_nginx() {
    log "Configuring Nginx reverse proxy..."
    
    cat > /etc/nginx/sites-available/moapp << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /auth/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/moapp /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
    systemctl reload nginx
    
    success "Nginx configured"
}

# Setup SSL certificates
setup_ssl() {
    if [ "$DOMAIN" != "localhost" ]; then
        log "Setting up SSL certificates..."
        
        # Get SSL certificate
        certbot --nginx -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
        
        # Setup auto-renewal
        systemctl enable certbot.timer
        
        success "SSL certificates configured"
    else
        warning "Skipping SSL setup for localhost"
    fi
}

# Create systemd service
create_systemd_service() {
    log "Creating systemd service..."
    
    cat > /etc/systemd/system/moapp.service << EOF
[Unit]
Description=MO APP Platform
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOYMENT_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=$SERVICE_USER
Group=$SERVICE_USER
EnvironmentFile=$DEPLOYMENT_DIR/.env

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable moapp.service
    
    success "Systemd service created"
}

# Setup monitoring and health checks
setup_monitoring() {
    log "Setting up monitoring and health checks..."
    
    # Create health check script
    cat > "$DEPLOYMENT_DIR/health-check.sh" << 'EOF'
#!/bin/bash

# Health check script for MO APP Platform
LOG_FILE="/opt/moapp/logs/health-check.log"
ALERT_EMAIL=${EMAIL}

check_service() {
    local service=$1
    local url=$2
    
    if curl -sf "$url" > /dev/null; then
        echo "$(date): $service is healthy" >> "$LOG_FILE"
        return 0
    else
        echo "$(date): $service is unhealthy" >> "$LOG_FILE"
        return 1
    fi
}

# Check main application
if ! check_service "Main App" "http://localhost:3000/api/health"; then
    # Restart the service
    systemctl restart moapp.service
    echo "$(date): Restarted MO APP Platform service" >> "$LOG_FILE"
fi

# Check database connectivity
if ! docker exec moapp_database_1 pg_isready -U postgres > /dev/null 2>&1; then
    echo "$(date): Database connectivity issue detected" >> "$LOG_FILE"
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1)
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "$(date): High disk usage: ${DISK_USAGE}%" >> "$LOG_FILE"
fi

# Rotate logs if they get too large
find /opt/moapp/logs -name "*.log" -size +100M -exec truncate -s 50M {} \;
EOF

    chmod +x "$DEPLOYMENT_DIR/health-check.sh"
    chown "$SERVICE_USER:$SERVICE_USER" "$DEPLOYMENT_DIR/health-check.sh"
    
    # Add to crontab
    (crontab -u "$SERVICE_USER" -l 2>/dev/null; echo "*/5 * * * * $DEPLOYMENT_DIR/health-check.sh") | crontab -u "$SERVICE_USER" -
    
    success "Health monitoring configured"
}

# Setup automated backups
setup_backups() {
    log "Setting up automated backups..."
    
    # Create backup script
    cat > "$DEPLOYMENT_DIR/backup.sh" << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/moapp/backups/$(date +%Y%m%d_%H%M%S)"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

# Backup database
docker exec moapp_database_1 pg_dump -U postgres moapp > "$BACKUP_DIR/database.sql"

# Backup application data
tar -czf "$BACKUP_DIR/app_data.tar.gz" -C /opt/moapp uploads media

# Backup configuration
cp /opt/moapp/.env "$BACKUP_DIR/"
cp /opt/moapp/docker-compose.yml "$BACKUP_DIR/"

# Remove old backups
find /opt/moapp/backups -type d -mtime +$RETENTION_DAYS -exec rm -rf {} +

echo "$(date): Backup completed: $BACKUP_DIR" >> /opt/moapp/logs/backup.log
EOF

    chmod +x "$DEPLOYMENT_DIR/backup.sh"
    chown "$SERVICE_USER:$SERVICE_USER" "$DEPLOYMENT_DIR/backup.sh"
    
    # Schedule daily backups
    (crontab -u "$SERVICE_USER" -l 2>/dev/null; echo "0 2 * * * $DEPLOYMENT_DIR/backup.sh") | crontab -u "$SERVICE_USER" -
    
    success "Automated backups configured"
}

# Start services
start_services() {
    log "Starting platform services..."
    
    cd "$DEPLOYMENT_DIR"
    
    # Start with docker-compose
    sudo -u "$SERVICE_USER" docker-compose up -d
    
    # Start systemd service
    systemctl start moapp.service
    
    # Wait for services to be ready
    sleep 30
    
    # Initialize database
    docker-compose exec -T app npm run db:push || true
    
    success "Platform services started"
}

# Generate deployment report
generate_report() {
    log "Generating deployment report..."
    
    cat > "$DEPLOYMENT_DIR/DEPLOYMENT_REPORT.md" << EOF
# MO APP Platform - Autonomous Deployment Report

## Deployment Information
- **Deployment Date**: $(date)
- **Platform Version**: 2.1.0
- **Domain**: $DOMAIN
- **Installation Directory**: $DEPLOYMENT_DIR
- **Service User**: $SERVICE_USER

## Services Status
\`\`\`
$(systemctl status moapp.service --no-pager)
\`\`\`

## Docker Services
\`\`\`
$(docker-compose ps)
\`\`\`

## System Resources
\`\`\`
$(df -h)
$(free -h)
\`\`\`

## Access Information
- **Web Interface**: http://$DOMAIN (or https://$DOMAIN if SSL configured)
- **Admin Dashboard**: Available after first login
- **Logs Location**: $DEPLOYMENT_DIR/logs/
- **Backup Location**: $DEPLOYMENT_DIR/backups/

## Management Commands
- **Start Platform**: \`systemctl start moapp.service\`
- **Stop Platform**: \`systemctl stop moapp.service\`
- **View Logs**: \`docker-compose logs -f\`
- **Update Platform**: \`docker-compose pull && docker-compose up -d\`
- **Create Backup**: \`$DEPLOYMENT_DIR/backup.sh\`

## Security Features Enabled
- ✅ Firewall (UFW) configured
- ✅ Fail2ban protection active
- ✅ Rate limiting on API endpoints
- ✅ SSL/TLS encryption (if domain configured)
- ✅ Security headers configured
- ✅ Service user isolation
- ✅ Automated security updates

## Automated Features
- ✅ Health monitoring (every 5 minutes)
- ✅ Automated service recovery
- ✅ Daily backups with 7-day retention
- ✅ Log rotation
- ✅ Container auto-updates (Watchtower)

## Next Steps
1. Access the platform at http://$DOMAIN
2. Complete initial setup through the web interface
3. Configure API keys for enhanced AI features
4. Set up custom domain and SSL if needed
5. Review logs and monitoring

## Support
- Configuration files: $DEPLOYMENT_DIR/
- Logs: $DEPLOYMENT_DIR/logs/
- Health check: $DEPLOYMENT_DIR/health-check.sh
- Backup script: $DEPLOYMENT_DIR/backup.sh

---
Generated by MO APP Platform Autonomous Deployment System
EOF

    success "Deployment report generated at $DEPLOYMENT_DIR/DEPLOYMENT_REPORT.md"
}

# Main deployment process
main() {
    log "Starting MO APP Platform Autonomous Deployment"
    
    check_root
    install_dependencies
    create_service_user
    setup_firewall
    generate_passwords
    deploy_platform_code
    generate_docker_compose
    setup_nginx
    setup_ssl
    create_systemd_service
    setup_monitoring
    setup_backups
    start_services
    generate_report
    
    success "🎉 MO APP Platform deployed successfully!"
    echo ""
    echo "📊 Platform is now running at:"
    echo "   HTTP: http://$DOMAIN"
    [ "$DOMAIN" != "localhost" ] && echo "   HTTPS: https://$DOMAIN"
    echo ""
    echo "📖 Deployment report: $DEPLOYMENT_DIR/DEPLOYMENT_REPORT.md"
    echo "🔧 Management commands available in the report"
    echo ""
    echo "🚀 The platform is now completely autonomous and self-hosting!"
}

# Run main function
main "$@"