import { db } from "./index";
import { 
  unitsTable, categoriesTable, productsTable, suppliersTable, customersTable, 
  purchasesTable, purchaseItemsTable, stockMutationsTable, cashEntriesTable,
  salesTable, saleItemsTable, payablesTable, receivablesTable
} from "./schema";
import { eq } from "drizzle-orm";

async function runSeed() {
  console.log("Mulai proses seeding data dummy...");

  // 1. Satuan
  console.log("Membuat Satuan...");
  await db.insert(unitsTable).values([
    { name: "METER", symbol: "m" },
    { name: "YARD", symbol: "yds" },
    { name: "KILOGRAM", symbol: "kg" },
    { name: "ROLL", symbol: "roll" },
    { name: "PCS", symbol: "pcs" },
    { name: "BAL", symbol: "bal" },
  ]);

  // 1. Kategori
  console.log("Membuat Kategori...");
  const [catKatun, catSatin, catDenim] = await db.insert(categoriesTable).values([
    { name: "Kain Katun", description: "Bahan katun adem" },
    { name: "Kain Satin", description: "Bahan mengkilap halus" },
    { name: "Kain Denim", description: "Bahan jeans tebal" },
  ]).returning();

  // 2. Produk
  console.log("Membuat Produk...");
  const products = await db.insert(productsTable).values([
    { name: "Katun Jepang Putih", categoryId: catKatun.id, barcode: "11111111", primaryUnit: "METER", secondaryUnit: "ROLL", pricePerMeter: "35000", pricePerRoll: "2000000", rollStock: "0", meterStock: "0", minStock: "5", lotNumber: "LT-001", rackLocation: "A1" },
    { name: "Katun Jepang Hitam", categoryId: catKatun.id, barcode: "22222222", primaryUnit: "METER", secondaryUnit: "ROLL", pricePerMeter: "35000", pricePerRoll: "2000000", rollStock: "0", meterStock: "0", minStock: "5", lotNumber: "LT-002", rackLocation: "A2" },
    { name: "Satin Velvet Merah", categoryId: catSatin.id, barcode: "33333333", primaryUnit: "YARD", secondaryUnit: "ROLL", pricePerMeter: "45000", pricePerRoll: "2500000", rollStock: "0", meterStock: "0", minStock: "5", lotNumber: "LT-003", rackLocation: "B1" },
    { name: "Denim Premium Blue", categoryId: catDenim.id, barcode: "44444444", primaryUnit: "KG", secondaryUnit: "BAL", pricePerMeter: "65000", pricePerRoll: "4000000", rollStock: "0", meterStock: "0", minStock: "5", lotNumber: "LT-004", rackLocation: "C1" },
  ]).returning();

  // 3. Supplier
  console.log("Membuat Supplier...");
  const [sup1] = await db.insert(suppliersTable).values([
    { name: "PT Maju Tekstil", phone: "081111111", address: "Bandung" },
    { name: "CV Kain Berkah", phone: "082222222", address: "Jakarta" },
  ]).returning();

  // 4. Pelanggan
  console.log("Membuat Pelanggan...");
  const [cust1, cust2] = await db.insert(customersTable).values([
    { name: "Butik Indah", phone: "083333333", address: "Surabaya", creditLimit: "10000000" },
    { name: "Penjahit Yanto", phone: "084444444", address: "Semarang", creditLimit: "5000000" },
  ]).returning();

  // 5. Transaksi Pembelian (Restock semua barang)
  console.log("Mencatat Pembelian (Stok Masuk)...");
  const [purchase] = await db.insert(purchasesTable).values({
    invoiceNumber: "INV-PUR-" + Date.now(),
    supplierId: sup1.id,
    paymentType: "tunai",
    totalAmount: "42000000",
    paidAmount: "42000000",
    status: "lunas"
  }).returning();

  for (const p of products) {
    // Beli 10 roll (misal 1 roll = 60 meter)
    await db.insert(purchaseItemsTable).values({
      purchaseId: purchase.id,
      productId: p.id,
      rolls: "10",
      meters: "600",
      pricePerMeter: "25000",
      subtotal: "15000000"
    });

    // Mutasi
    await db.insert(stockMutationsTable).values({
      productId: p.id,
      type: "masuk",
      rolls: "10",
      meters: "600",
      description: "Pembelian awal stok",
      reference: purchase.invoiceNumber
    });

    // Update stok produk (10 roll)
    await db.update(productsTable)
      .set({ rollStock: "10", meterStock: "600" })
      .where(eq(productsTable.id, p.id));
  }

  // Kas keluar
  await db.insert(cashEntriesTable).values({
    type: "keluar",
    amount: "42000000",
    description: "Pembayaran tunai pembelian supplier",
    reference: purchase.invoiceNumber
  });

  // 6. Transaksi Penjualan
  console.log("Mencatat Penjualan...");
  const [sale1] = await db.insert(salesTable).values({
    invoiceNumber: "INV-SAL-" + Date.now(),
    customerId: cust1.id,
    paymentType: "tunai",
    totalAmount: "2000000",
    paidAmount: "2000000",
    status: "lunas"
  }).returning();

  await db.insert(saleItemsTable).values({
    saleId: sale1.id,
    productId: products[0].id, // Katun Putih
    rolls: "1",
    meters: "60",
    pricePerMeter: "35000",
    subtotal: "2000000"
  });

  await db.insert(stockMutationsTable).values({
    productId: products[0].id,
    type: "keluar",
    rolls: "1",
    meters: "60",
    description: "Penjualan tunai",
    reference: sale1.invoiceNumber
  });

  // Update stok (berkurang 1 roll / 60 meter)
  await db.update(productsTable)
    .set({ rollStock: "9", meterStock: "540" })
    .where(eq(productsTable.id, products[0].id));

  // Kas masuk
  await db.insert(cashEntriesTable).values({
    type: "masuk",
    amount: "2000000",
    description: "Penerimaan tunai penjualan ke Butik Indah",
    reference: sale1.invoiceNumber
  });

  // 7. Transaksi Pembelian Tempo (Menciptakan HUTANG)
  console.log("Mencatat Hutang (Pembelian Tempo)...");
  const [purchaseTempo] = await db.insert(purchasesTable).values({
    invoiceNumber: "INV-PUR-" + (Date.now() + 1),
    supplierId: sup1.id,
    paymentType: "tempo",
    totalAmount: "15000000",
    paidAmount: "0",
    status: "tempo",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Jatuh tempo 7 hari
  }).returning();

  await db.insert(purchaseItemsTable).values({
    purchaseId: purchaseTempo.id,
    productId: products[1].id,
    rolls: "5",
    meters: "300",
    pricePerMeter: "25000",
    subtotal: "7500000"
  });

  await db.insert(payablesTable).values({
    purchaseId: purchaseTempo.id,
    supplierId: sup1.id,
    totalAmount: "15000000",
    paidAmount: "0",
    status: "unpaid",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  // 8. Transaksi Penjualan Tempo (Menciptakan PIUTANG)
  console.log("Mencatat Piutang (Penjualan Tempo)...");
  const [saleTempo] = await db.insert(salesTable).values({
    invoiceNumber: "INV-SAL-" + (Date.now() + 1),
    customerId: cust2.id,
    paymentType: "tempo",
    totalAmount: "8500000",
    paidAmount: "0",
    status: "tempo",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Jatuh tempo 14 hari
  }).returning();

  await db.insert(saleItemsTable).values({
    saleId: saleTempo.id,
    productId: products[2].id,
    rolls: "2",
    meters: "120",
    pricePerMeter: "45000",
    subtotal: "5400000"
  });

  await db.insert(receivablesTable).values({
    saleId: saleTempo.id,
    customerId: cust2.id,
    totalAmount: "8500000",
    paidAmount: "0",
    status: "unpaid",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  });

  // 9. Transaksi Penjualan Masif (Histori 30 Hari Terakhir & Hari Ini)
  console.log("Mencatat Histori Transaksi Penjualan Masif untuk Grafik & Laporan...");
  const today = new Date();
  
  for (let i = 0; i <= 30; i++) {
    // Generate 1-3 transaksi per hari (untuk hari ini kita buat lebih banyak)
    const numSales = i === 0 ? 5 : Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < numSales; j++) {
      // Mundur i hari ke belakang
      const txDate = new Date(today);
      txDate.setDate(today.getDate() - i);
      txDate.setHours(Math.floor(Math.random() * 10) + 8); // Jam 8 pagi - 6 sore

      const randProduct = products[Math.floor(Math.random() * products.length)];
      const isCust1 = Math.random() > 0.5;
      const randCustomer = isCust1 ? cust1 : cust2;
      const randRolls = Math.floor(Math.random() * 3) + 1;
      const meters = randRolls * 60;
      const pricePerMeter = Number(randProduct.pricePerMeter);
      const subtotal = meters * pricePerMeter;

      const [bulkSale] = await db.insert(salesTable).values({
        invoiceNumber: `INV-H-${i}-${j}-${Math.floor(Math.random() * 1000)}`,
        customerId: randCustomer.id,
        paymentType: "tunai",
        totalAmount: subtotal.toString(),
        paidAmount: subtotal.toString(),
        status: "lunas",
        createdAt: txDate,
        updatedAt: txDate
      }).returning();

      await db.insert(saleItemsTable).values({
        saleId: bulkSale.id,
        productId: randProduct.id,
        rolls: randRolls.toString(),
        meters: meters.toString(),
        pricePerMeter: pricePerMeter.toString(),
        subtotal: subtotal.toString()
      });

      // Kas masuk
      await db.insert(cashEntriesTable).values({
        type: "masuk",
        amount: subtotal.toString(),
        description: `Penjualan tunai ${bulkSale.invoiceNumber}`,
        reference: bulkSale.invoiceNumber,
        createdAt: txDate
      });
    }
  }

  console.log("Data dummy masif berhasil diisi! Semua grafik dan laporan siap digunakan.");
  process.exit(0);
}

runSeed().catch(err => {
  console.error("Gagal seed:", err);
  process.exit(1);
});
