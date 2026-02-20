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
  // Very easy – first steps (new users earn these quickly)
  { name: 'First Scan', description: 'Complete your first product scan', iconUrl: null, criteriaType: 'scans_total', criteriaValue: 1, displayOrder: 0 },
  { name: 'Second Scan', description: 'Scan your second product', iconUrl: null, criteriaType: 'scans_total', criteriaValue: 2, displayOrder: 1 },
  { name: 'Getting Started', description: 'Scan 3 products', iconUrl: null, criteriaType: 'scans_total', criteriaValue: 3, displayOrder: 2 },
  { name: 'Explorer', description: 'Scan 5 products', iconUrl: null, criteriaType: 'scans_total', criteriaValue: 5, displayOrder: 3 },
  { name: '10 Scans', description: 'Scan 10 products', iconUrl: null, criteriaType: 'scans_total', criteriaValue: 10, displayOrder: 4 },
  { name: '25 Scans', description: 'Scan 25 products', iconUrl: null, criteriaType: 'scans_total', criteriaValue: 25, displayOrder: 5 },
  { name: '50 Scans', description: 'Scan 50 products', iconUrl: null, criteriaType: 'scans_total', criteriaValue: 50, displayOrder: 6 },
  { name: 'Century', description: 'Scan 100 products', iconUrl: null, criteriaType: 'scans_total', criteriaValue: 100, displayOrder: 7 },
  // Eco – easy first, then progression
  { name: 'First Eco Choice', description: 'Scan your first A or B rated product', iconUrl: null, criteriaType: 'eco_products', criteriaValue: 1, displayOrder: 8 },
  { name: 'Eco Novice', description: 'Scan 5 eco-friendly (A/B) products', iconUrl: null, criteriaType: 'eco_products', criteriaValue: 5, displayOrder: 9 },
  { name: 'Eco Enthusiast', description: 'Scan 10 eco-friendly products', iconUrl: null, criteriaType: 'eco_products', criteriaValue: 10, displayOrder: 10 },
  { name: 'Eco Expert', description: 'Scan 20 eco-friendly products', iconUrl: null, criteriaType: 'eco_products', criteriaValue: 20, displayOrder: 11 },
  // Streaks – easy first
  { name: 'Streak Starter', description: 'Scan on 2 consecutive days', iconUrl: null, criteriaType: 'streak_days', criteriaValue: 2, displayOrder: 12 },
  { name: '3-Day Streak', description: 'Scan on 3 consecutive days', iconUrl: null, criteriaType: 'streak_days', criteriaValue: 3, displayOrder: 13 },
  { name: 'Week Warrior', description: 'Maintain a 7-day scan streak', iconUrl: null, criteriaType: 'streak_days', criteriaValue: 7, displayOrder: 14 },
  // Points – easier tiers first
  { name: 'Points Starter', description: 'Earn 25 points', iconUrl: null, criteriaType: 'points_total', criteriaValue: 25, displayOrder: 15 },
  { name: '50 Points', description: 'Earn 50 points', iconUrl: null, criteriaType: 'points_total', criteriaValue: 50, displayOrder: 16 },
  { name: 'Points Collector', description: 'Earn 100 points', iconUrl: null, criteriaType: 'points_total', criteriaValue: 100, displayOrder: 17 },
  { name: 'Points Champion', description: 'Earn 500 points', iconUrl: null, criteriaType: 'points_total', criteriaValue: 500, displayOrder: 18 },
];

async function main() {
  const challengeCount = await prisma.challenge.count();
  if (challengeCount === 0) {
    console.log('Seeding challenges...');
    await prisma.challenge.createMany({ data: challenges });
  } else {
    console.log('Challenges already exist, skipping.');
  }

  // Ensure every badge in our list exists (create if missing by name)
  let created = 0;
  for (const badge of badges) {
    const existing = await prisma.badge.findFirst({ where: { name: badge.name } });
    if (!existing) {
      await prisma.badge.create({ data: badge });
      created++;
    }
  }
  if (created > 0) {
    console.log(`Created ${created} new badge(s). Total badges in list: ${badges.length}.`);
  } else {
    console.log(`All ${badges.length} badges already exist.`);
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
