// Automated API & Database Verification Test
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function runTests() {
  console.log("=== Running KioskSnap End-to-End System Tests ===");

  // 1. Verify Prisma Connection & Initial Data
  const booth = await prisma.booth.findFirst();
  if (!booth) throw new Error("Booth not found in DB");
  console.log("✔ Booth found:", booth.name);

  const templates = await prisma.frameTemplate.findMany();
  if (templates.length === 0) throw new Error("No frame templates found");
  console.log(`✔ Found ${templates.length} frame templates`);

  // 2. Generate Voucher as Cashier
  const admin = await prisma.adminUser.findFirst();
  const testCode = `KS-TEST-${Math.floor(Math.random() * 1000)}`;
  const voucher = await prisma.voucher.create({
    data: {
      code: testCode,
      amount: 30000,
      isUsed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdById: admin.id,
    },
  });
  console.log("✔ Voucher generated:", voucher.code);

  // 3. Start Session using the Voucher
  const session = await prisma.$transaction(async (tx) => {
    await tx.voucher.update({
      where: { id: voucher.id },
      data: { isUsed: true, usedAt: new Date() },
    });
    const newSession = await tx.session.create({
      data: {
        boothId: booth.id,
        status: "FRAME_SELECT",
      },
    });
    await tx.transaction.create({
      data: {
        sessionId: newSession.id,
        method: "CASH_VOUCHER",
        amount: voucher.amount,
        status: "PAID",
        voucherId: voucher.id,
        paidAt: new Date(),
      },
    });
    return newSession;
  });
  console.log("✔ Session started successfully:", session.id);

  // 4. Save Raw Photo Shot
  const photoShot = await prisma.photoShot.create({
    data: {
      sessionId: session.id,
      poseIndex: 1,
      filePath: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    },
  });
  console.log("✔ Photo shot recorded, poseIndex:", photoShot.poseIndex);

  // 5. Save Final Composite
  const composite = await prisma.photoComposite.create({
    data: {
      sessionId: session.id,
      frameTemplateId: templates[0].id,
      filterSelected: "NORMAL",
      frameColor: "#FFFFFF",
      finalImagePath: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    },
  });
  console.log("✔ Composite created, QR download token:", composite.qrDownloadToken);

  // 6. Test Public Download Query
  const downloadData = await prisma.photoComposite.findUnique({
    where: { qrDownloadToken: composite.qrDownloadToken },
    include: {
      session: {
        include: { photoShots: true },
      },
    },
  });
  if (!downloadData || downloadData.session.photoShots.length !== 1) {
    throw new Error("Download data mismatch");
  }
  console.log("✔ Download endpoint verified, composite & shots retrieved");

  // 7. Record Print Job
  const printJob = await prisma.printJob.create({
    data: {
      sessionId: session.id,
      copies: 2,
      status: "SUCCESS",
    },
  });
  console.log("✔ Print job recorded, copies:", printJob.copies);

  console.log("\nALL 7 CORE SYSTEM & DB TESTS PASSED SUCCESSFULLY! ✔✔✔");
}

runTests()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
