import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Space", slug: "space" },
  { name: "Physics", slug: "physics" },
  { name: "Biology", slug: "biology" },
  { name: "Computers", slug: "computers" },
  { name: "Chemistry", slug: "chemistry" },
  { name: "Wildcard", slug: "wildcard" },
];

async function main() {
  console.log("🌱 Seeding categories...");

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
    console.log(`  ✓ ${cat.name} (${cat.slug})`);
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
