#!/bin/bash

# Self-Replication Script for MO APP Platform
# This script enables the platform to create copies of itself on other servers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLATFORM_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

usage() {
    cat << EOF
Usage: $0 [OPTIONS] TARGET_SERVER

Self-replicate MO APP Platform to another server

OPTIONS:
    -u, --user USER         SSH user for target server (default: root)
    -p, --port PORT         SSH port (default: 22)
    -d, --domain DOMAIN     Domain for target deployment
    -e, --email EMAIL       Email for SSL certificates
    --skip-ssl              Skip SSL certificate setup
    --dry-run               Show what would be done without executing
    -h, --help              Show this help message

EXAMPLES:
    $0 192.168.1.100
    $0 -u admin -d example.com -e admin@example.com server.example.com
    $0 --dry-run --domain test.com 10.0.0.50

EOF
}

# Default values
SSH_USER="root"
SSH_PORT="22"
DOMAIN=""
EMAIL=""
SKIP_SSL=false
DRY_RUN=false
TARGET_SERVER=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--user)
            SSH_USER="$2"
            shift 2
            ;;
        -p|--port)
            SSH_PORT="$2"
            shift 2
            ;;
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -e|--email)
            EMAIL="$2"
            shift 2
            ;;
        --skip-ssl)
            SKIP_SSL=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        -*)
            error "Unknown option: $1"
            ;;
        *)
            if [ -z "$TARGET_SERVER" ]; then
                TARGET_SERVER="$1"
            else
                error "Multiple target servers specified"
            fi
            shift
            ;;
    esac
done

if [ -z "$TARGET_SERVER" ]; then
    error "Target server is required"
fi

# Set default domain to target server if not specified
if [ -z "$DOMAIN" ]; then
    DOMAIN="$TARGET_SERVER"
fi

# Set default email if not specified
if [ -z "$EMAIL" ] && [ "$SKIP_SSL" = false ]; then
    EMAIL="admin@$DOMAIN"
fi

ssh_exec() {
    local command="$1"
    if [ "$DRY_RUN" = true ]; then
        echo "Would execute on $TARGET_SERVER: $command"
        return 0
    fi
    ssh -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$TARGET_SERVER" "$command"
}

ssh_copy() {
    local source="$1"
    local dest="$2"
    if [ "$DRY_RUN" = true ]; then
        echo "Would copy $source to $TARGET_SERVER:$dest"
        return 0
    fi
    scp -o StrictHostKeyChecking=no -P "$SSH_PORT" -r "$source" "$SSH_USER@$TARGET_SERVER:$dest"
}

check_connectivity() {
    log "Checking connectivity to $TARGET_SERVER..."
    
    if [ "$DRY_RUN" = true ]; then
        success "Dry run: Would check connectivity"
        return 0
    fi
    
    if ! ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$TARGET_SERVER" "echo 'Connection successful'" >/dev/null 2>&1; then
        error "Cannot connect to $TARGET_SERVER. Please check your SSH connection."
    fi
    
    success "Connection to $TARGET_SERVER established"
}

prepare_deployment_package() {
    log "Preparing deployment package..."
    
    local temp_dir="/tmp/moapp-replication-$$"
    mkdir -p "$temp_dir"
    
    # Copy platform files
    cp -r "$PLATFORM_ROOT"/* "$temp_dir/"
    
    # Remove development files
    rm -rf "$temp_dir/node_modules" "$temp_dir/.git" "$temp_dir/dist" 2>/dev/null || true
    
    # Create replication configuration
    cat > "$temp_dir/replication.env" << EOF
REPLICATION_SOURCE=$(hostname)
REPLICATION_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TARGET_DOMAIN=$DOMAIN
TARGET_EMAIL=$EMAIL
SKIP_SSL=$SKIP_SSL
EOF
    
    # Make deployment script executable
    chmod +x "$temp_dir/server/scripts/autonomous-deployment.sh"
    
    echo "$temp_dir"
}

replicate_to_target() {
    log "Replicating platform to $TARGET_SERVER..."
    
    local temp_dir=$(prepare_deployment_package)
    
    # Copy deployment package to target
    ssh_exec "mkdir -p /tmp/moapp-deployment"
    ssh_copy "$temp_dir/*" "/tmp/moapp-deployment/"
    
    # Set environment variables for deployment
    local env_vars=""
    if [ -n "$DOMAIN" ]; then
        env_vars="$env_vars DOMAIN=$DOMAIN"
    fi
    if [ -n "$EMAIL" ]; then
        env_vars="$env_vars EMAIL=$EMAIL"
    fi
    
    # Execute autonomous deployment on target
    ssh_exec "$env_vars /tmp/moapp-deployment/server/scripts/autonomous-deployment.sh"
    
    # Cleanup
    rm -rf "$temp_dir"
    ssh_exec "rm -rf /tmp/moapp-deployment"
    
    success "Platform replicated successfully to $TARGET_SERVER"
}

verify_deployment() {
    log "Verifying deployment on $TARGET_SERVER..."
    
    # Check if services are running
    if ssh_exec "systemctl is-active moapp.service >/dev/null 2>&1"; then
        success "MO APP Platform service is running"
    else
        warning "Platform service may not be running properly"
    fi
    
    # Check web interface accessibility
    if ssh_exec "curl -sf http://localhost:3000 >/dev/null 2>&1"; then
        success "Web interface is accessible"
    else
        warning "Web interface may not be accessible"
    fi
    
    # Display access information
    echo ""
    echo "🎉 Platform successfully replicated to $TARGET_SERVER!"
    echo ""
    echo "📊 Access Information:"
    echo "   HTTP:  http://$DOMAIN"
    if [ "$SKIP_SSL" = false ] && [ "$DOMAIN" != "localhost" ]; then
        echo "   HTTPS: https://$DOMAIN"
    fi
    echo ""
    echo "🔧 Management Commands (on target server):"
    echo "   systemctl status moapp.service"
    echo "   docker-compose -f /opt/moapp/docker-compose.yml ps"
    echo "   tail -f /opt/moapp/logs/*.log"
    echo ""
}

create_replication_log() {
    log "Creating replication log..."
    
    local log_file="$PLATFORM_ROOT/replication-log-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$log_file" << EOF
{
  "replication_id": "$(uuidgen 2>/dev/null || echo "repl-$(date +%s)")",
  "source": {
    "hostname": "$(hostname)",
    "ip": "$(curl -s ifconfig.me 2>/dev/null || echo 'unknown')",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "platform_version": "2.1.0"
  },
  "target": {
    "server": "$TARGET_SERVER",
    "domain": "$DOMAIN",
    "email": "$EMAIL",
    "ssh_user": "$SSH_USER",
    "ssh_port": "$SSH_PORT",
    "ssl_enabled": $([ "$SKIP_SSL" = false ] && echo "true" || echo "false")
  },
  "status": "completed",
  "deployment_features": [
    "autonomous_hosting",
    "self_monitoring", 
    "automated_backups",
    "security_hardening",
    "ssl_certificates",
    "container_orchestration",
    "health_checks",
    "log_rotation"
  ]
}
EOF
    
    success "Replication log saved: $log_file"
}

# Main execution
main() {
    echo ""
    echo "🚀 MO APP Platform Self-Replication System"
    echo "=========================================="
    echo ""
    echo "Target Server: $TARGET_SERVER"
    echo "Domain: $DOMAIN"
    echo "SSH User: $SSH_USER"
    echo "SSH Port: $SSH_PORT"
    echo "Skip SSL: $SKIP_SSL"
    echo "Dry Run: $DRY_RUN"
    echo ""
    
    if [ "$DRY_RUN" = false ]; then
        read -p "Proceed with replication? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Replication cancelled by user"
            exit 0
        fi
    fi
    
    check_connectivity
    replicate_to_target
    verify_deployment
    create_replication_log
    
    success "🎊 Self-replication completed successfully!"
    echo ""
    echo "The platform can now:"
    echo "• Run completely autonomously on the target server"
    echo "• Self-monitor and auto-recover from failures"
    echo "• Automatically backup data and configurations"
    echo "• Scale and optimize resource usage"
    echo "• Replicate itself to additional servers"
    echo ""
}

# Run main function
main "$@"