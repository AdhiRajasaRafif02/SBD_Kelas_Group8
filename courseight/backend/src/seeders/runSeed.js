const mongoose = require("mongoose");
const dotenv = require("dotenv");
const {
  seedUsers,
  seedCourses,
  seedAssessments,
  seedDiscussions,
} = require("./seedData");

dotenv.config();

const runSeed = async () => {
  try {
    console.log("🚀 Starting database seeding...");
    console.log("📡 Connecting to MongoDB...");

    await mongoose.connect(process.env.DATABASE_URL);
    console.log("✅ Connected to MongoDB successfully");

    // Run seeders in order
    const users = await seedUsers();
    const courses = await seedCourses(users);
    const assessments = await seedAssessments(courses, users);
    const discussions = await seedDiscussions(courses, users);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Seeding Summary:");
    console.log(`👥 Users: ${users.length}`);
    console.log(`📚 Courses: ${courses.length}`);
    console.log(`📝 Assessments: ${assessments.length}`);
    console.log(`💬 Discussions: ${discussions.length}`);

    console.log("\n🔑 Demo Accounts:");
    console.log("Admin: admin@courseight.com / admin123");
    console.log("Instructor: instructor@courseight.com / instructor123");
    console.log("Student: student@courseight.com / student123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;