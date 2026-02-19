import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const challenges = [
  { title: 'Getting Started', description: 'Scan 5 products to get familiar with GreenLens', category: 'scan_count', pointsReward: 50, criteria: { target: 5 }, active: true, displayOrder: 0 },
  { title: 'Plastic Detective', description: 'Find 3 products with plastic in their category', category: 'category_count', pointsReward: 75, criteria: { target: 3, category: 'plastic' }, active: true, displayOrder: 1 },
  { title: 'Eco Shopper', description: 'Find 3 A or B rated eco-friendly products', category: 'eco_score', pointsReward: 100, criteria: { target: 3, ecoScores: ['A', 'B'] }, active: true, displayOrder: 2 },
  { title: 'Scan Master', description: 'Scan 25 products', category: 'scan_count', pointsReward: 150, criteria: { target: 25 }, active: true, displayOrder: 3 },
  { title: 'Week Warrior', description: 'Maintain a 7-day scan streak', category: 'streak', pointsReward: 200, criteria: { target: 7 }, active: true, displayOrder: 4 },
];

const badges = [
  { name: 'First Scan', description: 'Complete your first product scan', iconUrl: null, criteriaType: 'scans_total', criteriaValue: 1, displayOrder: 0 },
  { name: '10 Scans', description: 'Scan 10 products', iconUrl: null, criteriaType: 'scans_total', criteriaValue: 10, displayOrder: 1 },
  { name: '50 Scans', description: 'Scan 50 products', iconUrl: null, criteriaType: 'scans_total', criteriaValue: 50, displayOrder: 2 },
  { name: 'Eco Novice', description: 'Scan 5 eco-friendly (A/B) products', iconUrl: null, criteriaType: 'eco_products', criteriaValue: 5, displayOrder: 3 },
  { name: 'Eco Expert', description: 'Scan 20 eco-friendly products', iconUrl: null, criteriaType: 'eco_products', criteriaValue: 20, displayOrder: 4 },
  { name: '7-Day Streak', description: 'Maintain a 7-day scan streak', iconUrl: null, criteriaType: 'streak_days', criteriaValue: 7, displayOrder: 5 },
];

async function main() {
  const challengeCount = await prisma.challenge.count();
  if (challengeCount === 0) {
    console.log('Seeding challenges...');
    await prisma.challenge.createMany({ data: challenges });
  } else {
    console.log('Challenges already exist, skipping.');
  }

  const badgeCount = await prisma.badge.count();
  if (badgeCount === 0) {
    console.log('Seeding badges...');
    await prisma.badge.createMany({ data: badges });
  } else {
    console.log('Badges already exist, skipping.');
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
