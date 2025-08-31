#!/bin/bash

# AI Media Generation Dependencies Installer
# Installs all required Python libraries for AI media generation

set -e

echo "🤖 Installing AI Media Generation Dependencies"
echo "============================================="
echo "This will install Python libraries for:"
echo "- Image generation (Stable Diffusion)"
echo "- Voice synthesis (gTTS, pyttsx3)"
echo "- Video creation (MoviePy, OpenCV)"
echo "- Audio generation (MusicGen, PyTorch)"
echo ""

# Check Python version
python_version=$(python3 --version 2>&1 | grep -o '[0-9]\+\.[0-9]\+' | head -1)
echo "🐍 Python version detected: $python_version"

if [[ $(echo "$python_version 3.8" | awk '{print ($1 >= $2)}') == 0 ]]; then
    echo "❌ Python 3.8 or higher is required"
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv mo_ai_env

# Activate virtual environment
source mo_ai_env/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Core dependencies
echo "📚 Installing core dependencies..."
pip install numpy==1.24.3 pillow==10.0.1 opencv-python==4.8.1.78

# Audio/Video processing
echo "🎥 Installing video processing libraries..."
pip install moviepy==1.0.3 pygame==2.5.2

# AI/ML libraries
echo "🧠 Installing AI/ML libraries..."
pip install torch==2.0.1 torchvision==0.15.2 torchaudio==2.0.2 --index-url https://download.pytorch.org/whl/cpu

# Diffusion models
echo "🎨 Installing Stable Diffusion..."
pip install diffusers==0.21.4 transformers==4.34.1 accelerate==0.23.0

# Text-to-Speech
echo "🗣️ Installing text-to-speech libraries..."
pip install gtts==2.4.0 pyttsx3==2.90

# Additional utilities
echo "🔧 Installing utilities..."
pip install scipy==1.11.3 requests==2.31.0 aiofiles==23.2.1

# Optional: CUDA support (if available)
if command -v nvidia-smi &> /dev/null; then
    echo "🚀 NVIDIA GPU detected, installing CUDA support..."
    pip uninstall torch torchvision torchaudio -y
    pip install torch==2.0.1 torchvision==0.15.2 torchaudio==2.0.2 --index-url https://download.pytorch.org/whl/cu118
else
    echo "💻 CPU-only installation (no GPU acceleration)"
fi

# Install additional media processing tools
echo "🛠️ Installing system dependencies..."

# Check OS and install system dependencies
if command -v apt-get &> /dev/null; then
    echo "📦 Installing Ubuntu/Debian dependencies..."
    sudo apt-get update
    sudo apt-get install -y ffmpeg libsm6 libxext6 libfontconfig1 libxrender1 espeak espeak-data
elif command -v yum &> /dev/null; then
    echo "📦 Installing CentOS/RHEL dependencies..."
    sudo yum install -y ffmpeg espeak espeak-devel
elif command -v brew &> /dev/null; then
    echo "🍎 Installing macOS dependencies..."
    brew install ffmpeg espeak
else
    echo "⚠️ Manual installation required for ffmpeg and espeak"
fi

# Create startup script
echo "📝 Creating startup script..."
cat > start_ai_service.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
source mo_ai_env/bin/activate
python3 services/ai-media-service.py "$@"
EOF

chmod +x start_ai_service.sh

# Test installation
echo "🧪 Testing installation..."
source mo_ai_env/bin/activate
python3 -c "
import torch
import diffusers
import moviepy
import gtts
import cv2
import numpy as np
print('✅ All core libraries imported successfully')
print(f'🔥 PyTorch version: {torch.__version__}')
print(f'🎨 Diffusers version: {diffusers.__version__}')
print(f'🎬 MoviePy version: {moviepy.__version__}')
print(f'🗣️ gTTS available: {gtts.__version__}')
if torch.cuda.is_available():
    print(f'🚀 CUDA available: {torch.cuda.get_device_name(0)}')
else:
    print('💻 CPU mode (no GPU acceleration)')
"

echo ""
echo "🎉 Installation complete!"
echo "========================================"
echo "📁 Virtual environment: mo_ai_env/"
echo "🚀 Start service: ./start_ai_service.sh"
echo "🧪 Test generation: ./start_ai_service.sh --type image --prompt 'test'"
echo ""
echo "💡 Features available:"
echo "- ✅ Image generation (Stable Diffusion)"
echo "- ✅ Voice synthesis (gTTS + pyttsx3)"
echo "- ✅ Video creation (MoviePy + OpenCV)"  
echo "- ✅ Audio generation (PyTorch + NumPy)"
echo "- ✅ Free and unlimited usage"
echo ""
echo "🔗 Integration with MO App Development:"
echo "- API endpoint: /api/ai-media/generate"
echo "- Supports: video, image, voice, audio generation"
echo "- No subscription fees or usage limits"

# Create requirements.txt for easy reinstallation
echo "📋 Creating requirements.txt..."
pip freeze > requirements.txt

echo ""
echo "⚡ Ready for AI-powered media generation!"