
import { column, defineDb, defineTable, sql, } from 'astro:db';

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    email: column.text({ unique: true }),
    name: column.text({ optional: true }),
    password: column.text({ optional: true }),
    createdAt: column.date({ optional: true, default: new Date() }),
    roleId: column.text({ default: 'user' }),
    emailVerified: column.date({ optional: true }),
  },
});

export const UserProfile = defineTable({
  columns: {
    id: column.text({ primaryKey: true }), // UUID
    userId: column.text({ references: () => User.columns.id }), 
    lastName: column.text({ optional: true }),
    birthDate: column.date({ optional: true }),
    shift: column.text({ optional: true }),
    age: column.number({ optional: true }),
  },
});

const Role = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text({ unique: true }),
  },
});

const bakery_items = defineTable({
  columns: {
    // id: column.text({ primaryKey: true }),
    id: column.text({ primaryKey: true, default: sql`lower(hex(randomblob(16)))`}),
    name: column.text(),
    description: column.text({ optional: true }),
    price: column.number(),
    imageUrl: column.text({ optional: true }),
    createdAt: column.date({ default: sql`CURRENT_TIMESTAMP` }),
    isActive: column.boolean(),
    
    // user:column.text({references: () => User.columns.id}),
  }
});

export const Category = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
  }
});

const Bakery_itemsImg = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    Bakery_itemsId: column.text({ references: () => bakery_items.columns.id }),
    image: column.text(),
  }
})

const Suppliers = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    productType: column.text(),
    phone: column.text(),
    email: column.text(),
    city: column.text(),
    createdAt: column.text({ default: "(CURRENT_TIMESTAMP)" }),
  },
});

export const Sales = defineTable({  
  columns: {
    id: column.text({ primaryKey: true }),
    totalAmount: column.number({default: 0}),
    createdAt: column.text({ default: "(CURRENT_TIMESTAMP)" }),
    paymentMethod: column.text({ notNull: true, default: "'cash'" }),
    productId: column.text(),
    quantity: column.number({ default: 1 }),
  },
});

export const Purchases = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    productName: column.text(),    
    supplierId: column.text(),  
    quantity: column.text(),   
    unitPrice: column.text(),  
    total: column.text(),       
    purchaseDate: column.text({ default: "(CURRENT_DATE)" }),
    createdAt: column.text({ default: "(CURRENT_TIMESTAMP)" }),
  },
});

export const CashClosures = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    shift: column.text(), // Turno
    userId: column.text(), // Usuario responsable
    startTime: column.number(), // Timestamp inicio
    endTime: column.number(), // Timestamp cierre
    totalCash: column.number({ default: 0 }),
    totalCredit: column.number({ default: 0 }),
    totalDebit: column.number({ default: 0 }),
    totalTransfer: column.number({ default: 0 }),
    totalGcash: column.number({ default: 0 }),
    totalSales: column.number({ default: 0 }),
    declaredCash: column.number({ optional: true }), // Monto declarado por el cajero
    diff: column.number({ default: 0 }),
    notes: column.text({ optional: true }),
    createdAt: column.text({ default: "(CURRENT_TIMESTAMP)" }),
  },
});

export default defineDb({
  tables: { 
    User,
    UserProfile,
    Role,
    bakery_items,
    Category,
    Bakery_itemsImg, 
    Suppliers,
    Sales,
    Purchases,
    CashClosures,
  },
})
