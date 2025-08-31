import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { registerRoutes } from "./routes";
import fs from "fs";
import path from "path";
// Import log function and handle environment-specific imports
let log: any;
let setupVite: any;
let serveStatic: any;
import { storage } from "./storage";

const app = express();

// CORS and mobile support headers
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	res.header('X-Content-Type-Options', 'nosniff');
	res.header('X-Frame-Options', 'SAMEORIGIN'); // Changed from DENY to SAMEORIGIN for mobile compatibility
	res.header('X-XSS-Protection', '1; mode=block');
	res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
	res.header('Pragma', 'no-cache');
	res.header('Expires', '0');

	if (req.method === 'OPTIONS') {
		res.sendStatus(200);
	} else {
		next();
	}
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Session configuration
const PgSession = ConnectPgSimple(session);
app.use(session({
	store: new PgSession({
		pool: pool,
		tableName: 'sessions',
		createTableIfMissing: true
	}),
	secret: process.env.SESSION_SECRET || 'mo-app-dev-secret-key-change-in-production',
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
	}
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
	async (username: string, password: string, done) => {
		try {
			const user = await storage.getUserByUsername(username);
			if (!user) {
				return done(null, false, { message: 'Invalid username or password' });
			}

			// Simple password check (in production, use bcrypt)
			if (user.password !== password) {
				return done(null, false, { message: 'Invalid username or password' });
			}

			if (!user.isActive) {
				return done(null, false, { message: 'Account is disabled' });
			}

			return done(null, user);
		} catch (error) {
			return done(error);
		}
	}
));

passport.serializeUser((user: any, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
	try {
		const user = await storage.getUser(id);
		done(null, user);
	} catch (error) {
		done(error);
	}
});

app.use((req, res, next) => {
	const start = Date.now();
	const path = req.path;
	let capturedJsonResponse: Record<string, any> | undefined = undefined;

	const originalResJson = res.json;
	res.json = function(bodyJson, ...args) {
		capturedJsonResponse = bodyJson;
		return originalResJson.apply(res, [bodyJson, ...args]);
	};

	res.on("finish", () => {
		const duration = Date.now() - start;
		if (path.startsWith("/api")) {
			let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
			if (capturedJsonResponse) {
				logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
			}

			if (logLine.length > 80) {
				logLine = logLine.slice(0, 79) + "…";
			}

			log(logLine);
		}
	});

	next();
});

(async () => {
	// Initialize environment-specific functions
	if (process.env.NODE_ENV === "development") {
		const viteModule = await import("./vite");
		log = viteModule.log;
		setupVite = viteModule.setupVite;
		serveStatic = viteModule.serveStatic;
	} else {
		// Production mode - no vite imports needed
		log = (message: string, source = "express") => {
			const formattedTime = new Date().toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				second: "2-digit",
				hour12: true,
			});
			console.log(`${formattedTime} [${source}] ${message}`);
		};

		serveStatic = (app: any) => {
			const distPath = path.resolve(import.meta.dirname, "public");

			if (!fs.existsSync(distPath)) {
				throw new Error(
					`Could not find the build directory: ${distPath}, make sure to build the client first`,
				);
			}

			app.use(express.static(distPath));

			// fall through to index.html if the file doesn't exist
			app.use("*", (_req: any, res: any) => {
				res.sendFile(path.resolve(distPath, "index.html"));
			});
		};
	}

	const server = await registerRoutes(app);

	app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
		const status = err.status || err.statusCode || 500;
		const message = err.message || "Internal Server Error";

		res.status(status).json({ message });
		throw err;
	});

	// importantly only setup vite in development and after
	// setting up all the other routes so the catch-all route
	// doesn't interfere with the other routes
	if (process.env.NODE_ENV === "development") {
		await setupVite(app, server);
	} else {
		serveStatic(app);
	}

	// ALWAYS serve the app on the port specified in the environment variable PORT
	// Other ports are firewalled. Default to 5000 if not specified.
	// this serves both the API and the client.
	// It is the only port that is not firewalled.
	const port = parseInt(process.env.PORT || '5000', 10);
	server.listen(port, "0.0.0.0", () => {
		log(`serving on port ${port} - accessible from mobile devices`);
		log(`Local: http://localhost:${port}`);
		log(`Network: http://0.0.0.0:${port}`);
	});
})();
