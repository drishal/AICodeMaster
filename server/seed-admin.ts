import { storage } from "./storage";

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create default admin user
    const adminUser = await storage.createUser({
      username: "admin",
      password: "admin123", // Change this in production!
      email: "admin@moappdev.com",
      role: "admin",
      isActive: true
    });

    console.log("✅ Admin user created successfully:");
    console.log(`Username: ${adminUser.username}`);
    console.log(`Password: admin123`);
    console.log("⚠️  Please change the default password immediately!");
  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
  }
}

// Run if called directly (ES modules)
createAdminUser().then(() => {
  console.log("Admin user setup complete");
  process.exit(0);
}).catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});

export { createAdminUser };