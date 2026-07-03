import { pgTable, text, serial, integer, numeric, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Enums
export const paymentTypeEnum = pgEnum("payment_type", ["tunai", "tempo", "transfer", "cashless"]);
export const saleStatusEnum = pgEnum("sale_status", ["lunas", "tempo", "partial"]);
export const mutationTypeEnum = pgEnum("mutation_type", ["masuk", "keluar", "penyesuaian", "transfer_masuk", "transfer_keluar", "reject"]);
export const cashEntryTypeEnum = pgEnum("cash_entry_type", ["masuk", "keluar"]);

// Categories (Kategori)
export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;

// Units (Satuan)
export const unitsTable = pgTable("units", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUnitSchema = createInsertSchema(unitsTable).omit({ id: true, createdAt: true });
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Unit = typeof unitsTable.$inferSelect;

// Products (Barang)
export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  barcode: text("barcode").notNull().default(""),
  primaryUnit: text("primary_unit").notNull().default("METER"),
  secondaryUnit: text("secondary_unit").notNull().default("ROLL"),
  lotNumber: text("lot_number").notNull().default(""),
  rackLocation: text("rack_location").notNull().default(""),
  pricePerMeter: numeric("price_per_meter", { precision: 15, scale: 2 }).notNull().default("0"),
  pricePerRoll: numeric("price_per_roll", { precision: 15, scale: 2 }),
  costPricePerMeter: numeric("cost_price_per_meter", { precision: 15, scale: 2 }).notNull().default("0"),
  costPricePerRoll: numeric("cost_price_per_roll", { precision: 15, scale: 2 }),
  rollStock: numeric("roll_stock", { precision: 12, scale: 4 }).notNull().default("0"),
  meterStock: numeric("meter_stock", { precision: 12, scale: 4 }).notNull().default("0"),
  minStock: numeric("min_stock", { precision: 12, scale: 4 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

// Product Rolls (Detail Stiker per Barang)
export const productRollsTable = pgTable("product_rolls", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  barcode: text("barcode").notNull().unique(),
  originalLength: numeric("original_length", { precision: 12, scale: 4 }).notNull().default("0"),
  currentLength: numeric("current_length", { precision: 12, scale: 4 }).notNull().default("0"),
  status: text("status").notNull().default("available"), // available, empty
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductRollSchema = createInsertSchema(productRollsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProductRoll = z.infer<typeof insertProductRollSchema>;
export type ProductRoll = typeof productRollsTable.$inferSelect;

// Customers (Pelanggan)
export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  creditLimit: numeric("credit_limit", { precision: 15, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;

// Suppliers
export const suppliersTable = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  contactPerson: text("contact_person"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupplierSchema = createInsertSchema(suppliersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliersTable.$inferSelect;

// Sales (Penjualan)
export const salesTable = pgTable("sales", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  customerId: integer("customer_id").references(() => customersTable.id),
  paymentType: text("payment_type").notNull().default("tunai"),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  paidAmount: numeric("paid_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("lunas"),
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSaleSchema = createInsertSchema(salesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof salesTable.$inferSelect;

// Sale Line Items
export const saleItemsTable = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => salesTable.id),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  rollId: integer("roll_id").references(() => productRollsTable.id),
  rolls: numeric("rolls", { precision: 12, scale: 4 }).notNull().default("0"),
  meters: numeric("meters", { precision: 12, scale: 4 }).notNull().default("0"),
  pricePerMeter: numeric("price_per_meter", { precision: 15, scale: 2 }).notNull().default("0"),
  subtotal: numeric("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
});

export const insertSaleItemSchema = createInsertSchema(saleItemsTable).omit({ id: true });
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type SaleItem = typeof saleItemsTable.$inferSelect;

// Purchases (Pembelian)
export const purchasesTable = pgTable("purchases", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  supplierId: integer("supplier_id").notNull().references(() => suppliersTable.id),
  paymentType: text("payment_type").notNull().default("tunai"),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  paidAmount: numeric("paid_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("lunas"),
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPurchaseSchema = createInsertSchema(purchasesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchasesTable.$inferSelect;

// Purchase Line Items
export const purchaseItemsTable = pgTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").notNull().references(() => purchasesTable.id),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  rollId: integer("roll_id").references(() => productRollsTable.id),
  rolls: numeric("rolls", { precision: 12, scale: 4 }).notNull().default("0"),
  meters: numeric("meters", { precision: 12, scale: 4 }).notNull().default("0"),
  pricePerMeter: numeric("price_per_meter", { precision: 15, scale: 2 }).notNull().default("0"),
  subtotal: numeric("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
});

export const insertPurchaseItemSchema = createInsertSchema(purchaseItemsTable).omit({ id: true });
export type InsertPurchaseItem = z.infer<typeof insertPurchaseItemSchema>;
export type PurchaseItem = typeof purchaseItemsTable.$inferSelect;

// Stock Mutations (Mutasi)
export const stockMutationsTable = pgTable("stock_mutations", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  rollId: integer("roll_id").references(() => productRollsTable.id),
  type: text("type").notNull(),
  rolls: numeric("rolls", { precision: 12, scale: 4 }).notNull().default("0"),
  meters: numeric("meters", { precision: 12, scale: 4 }).notNull().default("0"),
  description: text("description").notNull(),
  reference: text("reference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStockMutationSchema = createInsertSchema(stockMutationsTable).omit({ id: true, createdAt: true });
export type InsertStockMutation = z.infer<typeof insertStockMutationSchema>;
export type StockMutation = typeof stockMutationsTable.$inferSelect;

// Receivables (Piutang) — linked to sales with tempo
export const receivablesTable = pgTable("receivables", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => salesTable.id),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  paidAmount: numeric("paid_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("unpaid"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payables (Hutang) — linked to purchases with tempo
export const payablesTable = pgTable("payables", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").notNull().references(() => purchasesTable.id),
  supplierId: integer("supplier_id").notNull().references(() => suppliersTable.id),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  paidAmount: numeric("paid_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("unpaid"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payments (for both receivables and payables)
export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  receivableId: integer("receivable_id").references(() => receivablesTable.id),
  payableId: integer("payable_id").references(() => payablesTable.id),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull().default("0"),
  paymentMethod: text("payment_method").notNull().default("tunai"),
  notes: text("notes"),
  paidAt: timestamp("paid_at").defaultNow().notNull(),
});

// Cash Book (Buku Kas)
export const cashEntriesTable = pgTable("cash_entries", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull().default("0"),
  description: text("description").notNull(),
  reference: text("reference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCashEntrySchema = createInsertSchema(cashEntriesTable).omit({ id: true, createdAt: true });
export type InsertCashEntry = z.infer<typeof insertCashEntrySchema>;
export type CashEntry = typeof cashEntriesTable.$inferSelect;

// Users (for authentication)
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof usersTable.$inferSelect;

// Payment Methods (Pengaturan Metode Pembayaran)
export const paymentMethodsTable = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethodsTable).omit({ id: true, createdAt: true });
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethodsTable.$inferSelect;

// Push Subscriptions
export const pushSubscriptionsTable = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptionsTable).omit({ id: true, createdAt: true });
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptionsTable.$inferSelect;


// Settings (Pengaturan Global)
export const settingsTable = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingSchema = createInsertSchema(settingsTable);
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settingsTable.$inferSelect;

