import { spawn, exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

interface Website {
  id: string;
  name: string;
  domain: string;
  template: string;
  status: 'active' | 'inactive' | 'building' | 'error';
  visitors: number;
  lastUpdated: string;
  description: string;
  technologies: string[];
  ssl: boolean;
  analytics: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
  };
  deploymentConfig?: {
    port: number;
    buildCommand: string;
    startCommand: string;
    envVars: Record<string, string>;
  };
}

interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  files: Record<string, string>;
  buildCommand: string;
  startCommand: string;
  dependencies: string[];
}

export class WebsiteManagerService {
  private websites: Map<string, Website> = new Map();
  private websitesDir = path.join(process.cwd(), 'websites');
  private templates: Map<string, WebsiteTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
    this.ensureWebsitesDirectory();
  }

  private async ensureWebsitesDirectory() {
    try {
      await fs.mkdir(this.websitesDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create websites directory:', error);
    }
  }

  private initializeTemplates() {
    // Business Landing Template
    this.templates.set('business', {
      id: 'business',
      name: 'Business Landing',
      description: 'Professional business website with contact forms and service sections',
      technologies: ['React', 'Tailwind CSS', 'Node.js'],
      buildCommand: 'npm run build',
      startCommand: 'npm start',
      dependencies: ['react', 'react-dom', 'tailwindcss', 'express'],
      files: {
        'package.json': JSON.stringify({
          name: 'business-website',
          version: '1.0.0',
          scripts: {
            build: 'react-scripts build',
            start: 'serve -s build -l 3000',
            dev: 'react-scripts start'
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            'react-scripts': '^5.0.1',
            tailwindcss: '^3.3.0',
            serve: '^14.2.0'
          }
        }, null, 2),
        'public/index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Professional Business</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>`,
        'src/index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`,
        'src/App.js': `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">BusinessPro</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#home" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                <a href="#services" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Services</a>
                <a href="#about" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">About</a>
                <a href="#contact" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Contact</a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <section id="home" className="relative py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Grow Your Business</span>
                <span className="block text-blue-600">With Professional Solutions</span>
              </h2>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                We provide comprehensive business solutions to help you succeed in today's competitive market.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <a href="#contact" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Our Services</h2>
              <p className="mt-4 text-lg text-gray-500">Professional solutions tailored to your needs</p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white mx-auto">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Fast Performance</h3>
                <p className="mt-2 text-base text-gray-500">Lightning-fast solutions that deliver results quickly and efficiently.</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white mx-auto">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Quality Assured</h3>
                <p className="mt-2 text-base text-gray-500">Rigorous quality control ensures excellence in every project.</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white mx-auto">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5Z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">24/7 Support</h3>
                <p className="mt-2 text-base text-gray-500">Round-the-clock support to keep your business running smoothly.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">&copy; 2024 BusinessPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;`,
        'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`,
        'tailwind.config.js': `module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
      }
    });

    // Portfolio Template
    this.templates.set('portfolio', {
      id: 'portfolio',
      name: 'Portfolio',
      description: 'Creative portfolio showcasing projects and skills',
      technologies: ['Next.js', 'TypeScript', 'Framer Motion'],
      buildCommand: 'npm run build',
      startCommand: 'npm start',
      dependencies: ['next', 'react', 'react-dom', 'typescript', 'framer-motion'],
      files: {
        'package.json': JSON.stringify({
          name: 'portfolio-website',
          version: '1.0.0',
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start -p 3000'
          },
          dependencies: {
            next: '^14.0.0',
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            typescript: '^5.0.0',
            'framer-motion': '^10.16.0',
            tailwindcss: '^3.3.0'
          }
        }, null, 2),
        'pages/index.tsx': `import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4">John Developer</h1>
            <p className="text-xl text-gray-400 mb-8">Full Stack Developer & Designer</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold"
            >
              View My Work
            </motion.button>
          </motion.div>
        </div>
      </header>

      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-gray-700 rounded-lg p-6"
              >
                <div className="h-48 bg-gray-600 rounded-lg mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Project {i}</h3>
                <p className="text-gray-400">Description of the amazing project goes here.</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}`,
        'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone'
}

module.exports = nextConfig`,
        'tailwind.config.js': `module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
      }
    });

    // Blog Template
    this.templates.set('blog', {
      id: 'blog',
      name: 'Blog/News',
      description: 'Content management system for blogs and news sites',
      technologies: ['Node.js', 'Express', 'EJS'],
      buildCommand: 'npm install',
      startCommand: 'npm start',
      dependencies: ['express', 'ejs', 'body-parser', 'multer'],
      files: {
        'package.json': JSON.stringify({
          name: 'blog-website',
          version: '1.0.0',
          scripts: {
            start: 'node server.js',
            dev: 'nodemon server.js'
          },
          dependencies: {
            express: '^4.18.0',
            ejs: '^3.1.0',
            'body-parser': '^1.20.0',
            multer: '^1.4.0'
          }
        }, null, 2),
        'server.js': `const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Sample blog posts
const posts = [
  {
    id: 1,
    title: 'Welcome to Our Blog',
    content: 'This is our first blog post. Stay tuned for more amazing content!',
    date: new Date().toLocaleDateString(),
    author: 'Admin'
  }
];

app.get('/', (req, res) => {
  res.render('index', { posts });
});

app.get('/post/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (post) {
    res.render('post', { post });
  } else {
    res.status(404).send('Post not found');
  }
});

app.listen(PORT, () => {
  console.log(\`Blog server running on port \${PORT}\`);
});`,
        'views/index.ejs': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Blog</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <header class="bg-white shadow-md">
        <div class="container mx-auto px-6 py-4">
            <h1 class="text-3xl font-bold text-gray-800">My Tech Blog</h1>
        </div>
    </header>

    <main class="container mx-auto px-6 py-8">
        <div class="max-w-4xl mx-auto">
            <% posts.forEach(post => { %>
                <article class="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 class="text-2xl font-bold mb-4">
                        <a href="/post/<%= post.id %>" class="text-blue-600 hover:text-blue-800">
                            <%= post.title %>
                        </a>
                    </h2>
                    <p class="text-gray-600 mb-4"><%= post.content %></p>
                    <div class="text-sm text-gray-500">
                        By <%= post.author %> on <%= post.date %>
                    </div>
                </article>
            <% }); %>
        </div>
    </main>
</body>
</html>`,
        'views/post.ejs': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= post.title %> - My Blog</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <header class="bg-white shadow-md">
        <div class="container mx-auto px-6 py-4">
            <h1 class="text-3xl font-bold text-gray-800">
                <a href="/" class="hover:text-blue-600">My Tech Blog</a>
            </h1>
        </div>
    </header>

    <main class="container mx-auto px-6 py-8">
        <div class="max-w-4xl mx-auto">
            <article class="bg-white rounded-lg shadow-md p-8">
                <h1 class="text-4xl font-bold mb-4"><%= post.title %></h1>
                <div class="text-sm text-gray-500 mb-6">
                    By <%= post.author %> on <%= post.date %>
                </div>
                <div class="prose max-w-none">
                    <p class="text-lg leading-relaxed"><%= post.content %></p>
                </div>
            </article>
        </div>
    </main>
</body>
</html>`
      }
    });
  }

  async createWebsite(websiteData: {
    name: string;
    domain: string;
    template: string;
    description: string;
  }): Promise<{ success: boolean; website?: Website; error?: string }> {
    try {
      const template = this.templates.get(websiteData.template);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      const website: Website = {
        id: Date.now().toString(),
        name: websiteData.name,
        domain: websiteData.domain,
        template: websiteData.template,
        status: 'building',
        visitors: 0,
        lastUpdated: 'Building...',
        description: websiteData.description,
        technologies: template.technologies,
        ssl: false,
        analytics: {
          pageViews: 0,
          uniqueVisitors: 0,
          bounceRate: 0
        },
        deploymentConfig: {
          port: 3000 + this.websites.size,
          buildCommand: template.buildCommand,
          startCommand: template.startCommand,
          envVars: {}
        }
      };

      this.websites.set(website.id, website);

      // Create website directory and files
      await this.generateWebsiteFiles(website.id, template);

      // Start build process
      this.buildWebsite(website.id);

      return { success: true, website };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async generateWebsiteFiles(websiteId: string, template: WebsiteTemplate) {
    const websiteDir = path.join(this.websitesDir, websiteId);
    await fs.mkdir(websiteDir, { recursive: true });

    // Write template files
    for (const [filePath, content] of Object.entries(template.files)) {
      const fullPath = path.join(websiteDir, filePath);
      const dirPath = path.dirname(fullPath);
      
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(fullPath, content);
    }
  }

  private async buildWebsite(websiteId: string) {
    const website = this.websites.get(websiteId);
    if (!website) return;

    const websiteDir = path.join(this.websitesDir, websiteId);

    try {
      // Install dependencies
      await this.runCommand('npm install', websiteDir);

      // Build the website
      if (website.deploymentConfig?.buildCommand) {
        await this.runCommand(website.deploymentConfig.buildCommand, websiteDir);
      }

      // Update website status
      website.status = 'active';
      website.lastUpdated = 'Just now';
      website.ssl = true;
      this.websites.set(websiteId, website);

      // Start the website server
      this.startWebsiteServer(websiteId);

    } catch (error) {
      console.error(`Build failed for website ${websiteId}:`, error);
      website.status = 'error';
      website.lastUpdated = 'Build failed';
      this.websites.set(websiteId, website);
    }
  }

  private async runCommand(command: string, cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private startWebsiteServer(websiteId: string) {
    const website = this.websites.get(websiteId);
    if (!website || !website.deploymentConfig) return;

    const websiteDir = path.join(this.websitesDir, websiteId);
    const port = website.deploymentConfig.port;

    // Start the server process
    const serverProcess = spawn('npm', ['start'], {
      cwd: websiteDir,
      env: {
        ...process.env,
        PORT: port.toString(),
        ...website.deploymentConfig.envVars
      },
      detached: true,
      stdio: 'ignore'
    });

    serverProcess.unref();
  }

  getWebsites(): Website[] {
    return Array.from(this.websites.values());
  }

  getWebsite(id: string): Website | undefined {
    return this.websites.get(id);
  }

  async deleteWebsite(id: string): Promise<boolean> {
    const website = this.websites.get(id);
    if (!website) return false;

    try {
      // Remove website directory
      const websiteDir = path.join(this.websitesDir, id);
      await fs.rm(websiteDir, { recursive: true, force: true });

      // Remove from memory
      this.websites.delete(id);

      return true;
    } catch (error) {
      console.error(`Failed to delete website ${id}:`, error);
      return false;
    }
  }

  async cloneWebsite(sourceId: string, newName: string, newDomain: string): Promise<{ success: boolean; website?: Website; error?: string }> {
    const sourceWebsite = this.websites.get(sourceId);
    if (!sourceWebsite) {
      return { success: false, error: 'Source website not found' };
    }

    const clonedWebsite: Website = {
      ...sourceWebsite,
      id: Date.now().toString(),
      name: newName,
      domain: newDomain,
      status: 'building',
      visitors: 0,
      ssl: false,
      analytics: {
        pageViews: 0,
        uniqueVisitors: 0,
        bounceRate: 0
      },
      deploymentConfig: {
        ...sourceWebsite.deploymentConfig!,
        port: 3000 + this.websites.size
      }
    };

    try {
      // Copy website files
      const sourceDir = path.join(this.websitesDir, sourceId);
      const targetDir = path.join(this.websitesDir, clonedWebsite.id);
      
      await this.copyDirectory(sourceDir, targetDir);

      this.websites.set(clonedWebsite.id, clonedWebsite);

      // Start build process for cloned website
      this.buildWebsite(clonedWebsite.id);

      return { success: true, website: clonedWebsite };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async copyDirectory(source: string, target: string) {
    await fs.mkdir(target, { recursive: true });
    const files = await fs.readdir(source, { withFileTypes: true });

    for (const file of files) {
      const sourcePath = path.join(source, file.name);
      const targetPath = path.join(target, file.name);

      if (file.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  getAvailableTemplates(): WebsiteTemplate[] {
    return Array.from(this.templates.values());
  }

  async updateWebsiteAnalytics(websiteId: string, analytics: Website['analytics']): Promise<boolean> {
    const website = this.websites.get(websiteId);
    if (!website) return false;

    website.analytics = analytics;
    website.visitors = analytics.uniqueVisitors;
    this.websites.set(websiteId, website);

    return true;
  }

  async deployAllWebsites(): Promise<{ deployed: number; failed: number }> {
    let deployed = 0;
    let failed = 0;

    for (const [id, website] of Array.from(this.websites.entries())) {
      if (website.status === 'inactive' || website.status === 'error') {
        try {
          await this.buildWebsite(id);
          deployed++;
        } catch (error) {
          failed++;
        }
      }
    }

    return { deployed, failed };
  }

  async enableSSLForAll(): Promise<{ enabled: number; failed: number }> {
    let enabled = 0;
    let failed = 0;

    for (const [id, website] of Array.from(this.websites.entries())) {
      if (!website.ssl && website.status === 'active') {
        try {
          // Simulate SSL enablement
          website.ssl = true;
          this.websites.set(id, website);
          enabled++;
        } catch (error) {
          failed++;
        }
      }
    }

    return { enabled, failed };
  }

  getSystemStats(): {
    totalWebsites: number;
    activeWebsites: number;
    totalVisitors: number;
    averageBounceRate: number;
    templatesUsed: number;
    sslEnabled: number;
  } {
    const websites = Array.from(this.websites.values());
    
    return {
      totalWebsites: websites.length,
      activeWebsites: websites.filter(w => w.status === 'active').length,
      totalVisitors: websites.reduce((sum, w) => sum + w.visitors, 0),
      averageBounceRate: websites.length > 0 
        ? websites.reduce((sum, w) => sum + w.analytics.bounceRate, 0) / websites.length
        : 0,
      templatesUsed: new Set(websites.map(w => w.template)).size,
      sslEnabled: websites.filter(w => w.ssl).length
    };
  }
}

export const websiteManagerService = new WebsiteManagerService();