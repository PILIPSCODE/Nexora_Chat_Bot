import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma seeding...');

  // ============================
  // USER
  // ============================
  const user = await prisma.user.upsert({
    where: { email: 'nexoraoraora@gmail.com' },
    update: {},
    create: {
      id: 'idtestuser001',
      firstName: 'testAkun',
      lastName: 'testAkun',
      email: 'nexoraoraora@gmail.com',
      password: '$2b$10$i/7654fHK3CxinbBFIR5wOKESmyYN5uPa1kynJH0J3G3xAYKlrm8W',
      role: 'user',
    },
  });

  console.log('✅ User:', user.id);

  // ============================
  // CATEGORY
  // ============================
  const categories = [
    'Elektronik',
    'Fashion',
    'Kesehatan',
    'Kecantikan',
    'Makanan',
    'Minuman',
    'Rumah Tangga',
    'Furniture',
    'Otomotif',
    'Hobi',
    'Olahraga',
    'Buku',
    'Alat Tulis & Kantor',
    'Bayi & Anak',
    'Mainan',
    'Komputer & Aksesoris',
    'Gaming',
    'Pertanian',
    'Peternakan',
    'Perkakas & Industri',
    'Bangunan & Konstruksi',
    'Alat Listrik',
    'Peralatan Dapur',
    'Dekorasi Rumah',
    'Produk Digital',
    'Jasa',
    'Software & Lisensi',
    'Properti',
    'Travel & Outdoor',
    'Kebutuhan Kantor',
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('✅ Categories seeded');

  // ============================
  // INTEGRATION
  // ============================
  const integrations = [
    { id: 1, name: 'whatsapp Bussiness', type: 'chatPlatform' },
    { id: 2, name: 'baileys', type: 'chatPlatform' },
    { id: 3, name: 'botFather', type: 'chatPlatform' },
    { id: 4, name: 'website', type: 'chatPlatform' },
  ];

  for (const i of integrations) {
    await prisma.integration.upsert({
      where: { id: i.id },
      update: i,
      create: i,
    });
  }

  console.log('✅ Integrations seeded');

  // ============================
  // USER INTEGRATION
  // ============================
  const userIntegrations = [
    {
      id: 'waba001',
      provider: 'whatsapp Bussiness',
      integrationId: 1,
    },
    {
      id: 'baileys001',
      provider: 'baileys',
      integrationId: 2,
    },
    {
      id: 'botFather001',
      provider: 'botFather',
      integrationId: 3,
    },
    {
      id: 'website001',
      provider: 'website',
      integrationId: 4,
    },
  ];

  for (const ui of userIntegrations) {
    await prisma.userIntegration.upsert({
      where: {
        userId_integrationId: {
          userId: user.id,
          integrationId: ui.integrationId,
        },
      },
      update: {
        isconnected: true,
        provider: ui.provider,
      },
      create: {
        id: ui.id,
        userId: user.id,
        isconnected: true,
        provider: ui.provider,
        integrationId: ui.integrationId,
      },
    });
  }

  console.log('✅ UserIntegration seeded');

  // ============================
  // CONTENT INTEGRATION
  // ============================
  const botIntegration = await prisma.userIntegration.findUnique({
    where: { id: 'botFather001' },
  });

  if (!botIntegration) {
    throw new Error('❌ botFather integration not found');
  }

  await prisma.contentIntegration.upsert({
    where: {
      userIntegrationId_type: {
        userIntegrationId: botIntegration.id,
        type: 'chatPlatform',
      },
    },
    update: {
      configJson: {
        botName: 'Customer_layanan_bot',
        provider: 'botFather',
        isUsed: false,
        accessToken:
          '00fa2b49a110d34b30a70feb5a939c4b:a9f1cd92283b9dcca626393bb869790d4bdaa629de54d38a61ca9bdb1ade28786fd4ffbff4955d6ea652ebc7915cb727',
      },
    },
    create: {
      userIntegrationId: botIntegration.id,
      type: 'chatPlatform',
      configJson: {
        botName: 'Customer_layanan_bot',
        provider: 'botFather',
        isUsed: false,
        accessToken:
          '00fa2b49a110d34b30a70feb5a939c4b:a9f1cd92283b9dcca626393bb869790d4bdaa629de54d38a61ca9bdb1ade28786fd4ffbff4955d6ea652ebc7915cb727',
      },
    },
  });

  console.log('✅ ContentIntegration seeded');

  // ============================
  // SUBSCRIPTION
  // ============================
  const sub = await prisma.subscribtion.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'unlimited',
      price: 10_000_000,
      durationDays: 999,
      initialToken: BigInt('999999999999999'),
    },
  });

  console.log('✅ Subscribtion:', sub.name);

  // ============================
  // USER SUBSCRIPTION
  // ============================
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + sub.durationDays);

  const userSubId = `usersub_${user.id}_${sub.id}`;
  await prisma.userSubcribtion.upsert({
    where: { id: userSubId },
    update: {
      tokenRemain: BigInt('999999999999999'),
      startDate,
      endDate,
    },
    create: {
      id: userSubId,
      userId: user.id,
      subcribtionId: sub.id,
      tokenRemain: BigInt('999999999999999'),
      startDate,
      endDate,
    },
  });

  console.log('✅ UserSubcribtion seeded');

  console.log('🎉 Seeding done successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeder failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
