const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Admin / Kasir
  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: 'admin123',
      role: 'ADMIN',
    },
  });

  // 2. Booth
  const existingBooth = await prisma.booth.findFirst();
  let booth = existingBooth;
  if (!booth) {
    booth = await prisma.booth.create({
      data: {
        name: 'Booth Kiosk 1',
        sessionTimeout: 90,
        isActive: true,
      },
    });
  }

  // 3. Frame Templates
  const templates = [
    {
      id: 'template-strip-3',
      name: '2×6" 3 Photo (Twin Strip)',
      layoutType: 'STRIP_2X6_3',
      slotsCount: 3,
      aspectRatio: '2:3',
      isActive: true,
    },
    {
      id: 'template-strip-4',
      name: '2×6" 4 Photo (Life4Cuts)',
      layoutType: 'STRIP_2X6_4',
      slotsCount: 4,
      aspectRatio: '2:3',
      isActive: true,
    },
    {
      id: 'template-card-6',
      name: '4×6" 6 Photo (Grid 2×3)',
      layoutType: 'CARD_4X6_6',
      slotsCount: 6,
      aspectRatio: '2:3',
      isActive: true,
    },
    {
      id: 'template-grid-4',
      name: '4×6" 4 Photo (Grid 2×2)',
      layoutType: 'CARD_4X6_4',
      slotsCount: 4,
      aspectRatio: '2:3',
      isActive: true,
    },
    {
      id: 'template-card-triple',
      name: '4×6" Triple Photo (3 Kolom)',
      layoutType: 'CARD_4X6_TRIPLE',
      slotsCount: 3,
      aspectRatio: '2:3',
      isActive: true,
    },
    {
      id: 'template-duo-2',
      name: '4×6" 2 Photo (Duo)',
      layoutType: 'CARD_4X6_2',
      slotsCount: 2,
      aspectRatio: '2:3',
      isActive: true,
    },
    {
      id: 'template-card-single',
      name: '4×6" Portrait Single Photo',
      layoutType: 'CARD_4X6_1',
      slotsCount: 1,
      aspectRatio: '2:3',
      isActive: true,
    },
  ];

  for (const t of templates) {
    await prisma.frameTemplate.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
  }

  // 4. Sample Vouchers
  const sampleVouchers = ['KS-7788', 'KS-1234', 'KS-9999'];
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  for (const code of sampleVouchers) {
    await prisma.voucher.upsert({
      where: { code },
      update: {},
      create: {
        code,
        amount: 30000,
        isUsed: false,
        expiresAt,
        createdById: admin.id,
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
