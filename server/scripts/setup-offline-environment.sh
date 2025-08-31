#!/usr/bin/env bash

# MO App Development - Offline Environment Setup Script
# This script installs a complete self-hosted development environment
# that replaces all Replit premium features

set -e

echo "🚀 MO App Development - Offline Environment Setup"
echo "=============================================="
echo "This will install a complete development stack including:"
echo "- VS Code Server (IDE)"
echo "- Gitea (Git hosting)"
echo "- Drone CI/CD (Deployments)"
echo "- PostgreSQL (Database)"
echo "- Vault (Secrets management)"
echo "- Tor proxy (Anonymous access)"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "⚠️  Do not run this script as root. It will prompt for sudo when needed."
   exit 1
fi

# Detect OS
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

echo "🔍 Detected system: $OS ($ARCH)"

# Install Docker if not present
install_docker() {
    echo "📦 Installing Docker..."
    
    if command -v docker &> /dev/null; then
        echo "✅ Docker already installed"
        return
    fi

    case $OS in
        linux*)
            # Ubuntu/Debian
            if command -v apt-get &> /dev/null; then
                sudo apt-get update
                sudo apt-get install -y ca-certificates curl gnupg lsb-release
                
                curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
                
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
                
                sudo apt-get update
                sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
                
            # CentOS/RHEL
            elif command -v yum &> /dev/null; then
                sudo yum install -y yum-utils
                sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
                sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
                
            # Alpine
            elif command -v apk &> /dev/null; then
                sudo apk add --update docker docker-compose
            fi
            
            # Start Docker service
            sudo systemctl enable docker
            sudo systemctl start docker
            
            # Add current user to docker group
            sudo usermod -aG docker $USER
            echo "⚠️  Log out and back in for Docker group membership to take effect"
            ;;
            
        darwin*)
            echo "🍎 For macOS, please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
            echo "Then re-run this script."
            exit 1
            ;;
            
        *)
            echo "❌ Unsupported operating system: $OS"
            exit 1
            ;;
    esac
}

# Install Docker Compose (standalone) if not present
install_docker_compose() {
    echo "📦 Installing Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        echo "✅ Docker Compose already installed"
        return
    fi
    
    # Install Docker Compose standalone
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
}

# Create directory structure
setup_directories() {
    echo "📁 Setting up directory structure..."
    
    mkdir -p mo-dev-environment/{workspace,auth,ssl,nginx,scripts}
    cd mo-dev-environment
    
    # Create nginx configuration
    cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream code-server {
        server code-server:8080;
    }
    
    upstream gitea {
        server gitea:3000;
    }
    
    upstream drone {
        server drone:80;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        location / {
            return 301 https://$server_name$request_uri;
        }
    }
    
    server {
        listen 443 ssl http2;
        server_name localhost;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        location /code/ {
            proxy_pass http://code-server/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
        
        location /git/ {
            proxy_pass http://gitea/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        location /ci/ {
            proxy_pass http://drone/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

    # Generate self-signed SSL certificates
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/CN=localhost"
    
    # Create htpasswd for registry
    mkdir -p auth
    echo "admin:$(openssl passwd -apr1 mo-registry-2025)" > auth/htpasswd
}

# Install Tor for anonymous development
install_tor() {
    echo "🔐 Installing Tor for anonymous development..."
    
    case $OS in
        linux*)
            if command -v apt-get &> /dev/null; then
                sudo apt-get install -y tor obfs4proxy
            elif command -v yum &> /dev/null; then
                sudo yum install -y tor obfs4proxy
            elif command -v apk &> /dev/null; then
                sudo apk add --update tor obfs4proxy
            fi
            
            # Configure Tor
            sudo tee -a /etc/tor/torrc << 'EOF'

# MO Development Hidden Service
HiddenServiceDir /var/lib/tor/mo_dev/
HiddenServicePort 80 127.0.0.1:80
HiddenServicePort 443 127.0.0.1:443
HiddenServiceVersion 3
EOF
            
            sudo systemctl enable tor
            sudo systemctl restart tor
            
            echo "🔐 Tor hidden service configured. Check /var/lib/tor/mo_dev/hostname for your .onion address"
            ;;
    esac
}

# Setup VPS deployment script
setup_vps_deployment() {
    echo "📝 Creating VPS deployment script..."
    
    cat > scripts/deploy-to-vps.sh << 'EOF'
#!/bin/bash

# VPS Deployment Script for MO Development Environment
# Usage: ./deploy-to-vps.sh <vps-ip> <ssh-key-path>

set -e

VPS_IP=$1
SSH_KEY=$2

if [ -z "$VPS_IP" ] || [ -z "$SSH_KEY" ]; then
    echo "Usage: $0 <vps-ip> <ssh-key-path>"
    exit 1
fi

echo "🚀 Deploying MO Development Environment to VPS: $VPS_IP"

# Copy files to VPS
scp -i "$SSH_KEY" -r ../docker-compose.yml ../nginx.conf ../ssl ../auth root@$VPS_IP:/opt/mo-dev/

# Install and start services on VPS
ssh -i "$SSH_KEY" root@$VPS_IP << 'ENDSSH'
cd /opt/mo-dev
docker-compose down || true
docker-compose pull
docker-compose up -d

echo "✅ MO Development Environment deployed successfully!"
echo "🌐 Access your services at:"
echo "- IDE: https://$VPS_IP:8443"
echo "- Git: http://$VPS_IP:3000"
echo "- CI/CD: http://$VPS_IP:8080"
echo "- Database: http://$VPS_IP:5050"
echo "- Vault: https://$VPS_IP:8200"
ENDSSH
EOF

    chmod +x scripts/deploy-to-vps.sh
}

# Main setup process
main() {
    echo "🔄 Starting installation process..."
    
    install_docker
    install_docker_compose
    setup_directories
    install_tor
    setup_vps_deployment
    
    # Copy the main docker-compose.yml file
    if [ -f "../docker-compose.yml" ]; then
        cp ../docker-compose.yml .
    else
        echo "⚠️  docker-compose.yml not found. Please ensure you're running this from the correct directory."
    fi
    
    echo ""
    echo "✅ Installation complete! Starting services..."
    echo ""
    
    # Start the services
    docker-compose up -d
    
    echo ""
    echo "🎉 MO Development Environment is now running!"
    echo "============================================"
    echo "📋 Access your services:"
    echo "- 💻 VS Code IDE: https://localhost:8443 (password: mo-dev-2025)"
    echo "- 🔄 Git Server: http://localhost:3000"
    echo "- 🚀 CI/CD Pipeline: http://localhost:8080"
    echo "- 🗄️  Database Admin: http://localhost:5050 (admin@mo-dev.local / admin123)"
    echo "- 🔐 Secrets Vault: https://localhost:8200 (token: mo-vault-token)"
    echo "- 🐳 Container Management: http://localhost:9000"
    echo ""
    echo "🔐 Tor Hidden Service:"
    if [ -f "/var/lib/tor/mo_dev/hostname" ]; then
        echo "- 🧅 Hidden Service: $(sudo cat /var/lib/tor/mo_dev/hostname)"
    else
        echo "- 🧅 Hidden Service: Will be available after Tor setup completes"
    fi
    echo ""
    echo "💡 Tips:"
    echo "- All services are now independent of Replit subscription"
    echo "- Use './scripts/deploy-to-vps.sh' to deploy to your VPS"
    echo "- Enable anonymous mode through Tor proxy on port 9050"
    echo "- Total cost: Only your VPS hosting (~$20-40/month)"
    echo ""
    echo "⚡ Your development environment is completely self-sufficient!"
}

# Run the main setup
main "$@"
