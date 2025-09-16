import { db, bakery_items, Bakery_itemsImg, Role, User, Suppliers, Purchases, CashClosures, Sales } from "astro:db";
import {v4 as UUID } from 'uuid';
import bcrypt from "bcryptjs";



// https://astro.build/db/seed
export default async function seed() {

	const roles = [
		{id: 'admin', name: 'Administrator'},
		{id: 'user', name: 'System User'},
	]

	const johnDoe = {
		id: UUID(),
		name: 'John Doe',
		email: 'john@google.com',
		password: bcrypt.hashSync('123456'),
		role: 'admin',
	}

	const joahnDoe = {
		id: UUID(),
		name: 'Joahn Doe',
		email: 'joahn@google.com',
		password: bcrypt.hashSync('123456'),
		role: 'user',
	}

	await db.insert(bakery_items).values([
		  {
    		name: 'Pan de Campo',
    		description: 'Pan tradicional con corteza crocante.',
    		price: 4.99,
    		imageUrl: '',
    		isActive: true,
  		},
		{
			name: 'Facturas',
    		description: 'Variedad de facturas dulces.',
    		price: 2.5,
    		imageUrl: '',
    		isActive: true,
		},
	]);
	await db.insert(Suppliers).values([
    {
      id: crypto.randomUUID(),
      name: "Harinas SA",
      productType: "Harina",
      phone: "123456789",
      email: "ventas@harinas.com",
      city: "Madrid",
    },
    {
      id: crypto.randomUUID(),
      name: "Lácteos SRL",
      productType: "Lácteos",
      phone: "987654321",
      email: "contacto@lacteos.com",
      city: "Barcelona",
    },
  ]);

  await db.insert(Purchases).values([
    {
      id: crypto.randomUUID(),
      productName: "Algo",
      supplierId: "6c0c61e0-69a7-4e3a-a02b-c08d4bdd11b0",
      quantity: "10",          
      unitPrice: "25.5",       
      total: String(10 * 25.5),
      purchaseDate: "2025-09-11",
      createdAt: new Date().toISOString(),
    },
  ]);
  await db.insert(Sales).values([
  {
    id: crypto.randomUUID(),
    totalAmount: 1500,
    createdAt: new Date().toISOString(),
    paymentMethod: "cash",
    productId: "prod_001",
    quantity: 2,
  },
  {
    id: crypto.randomUUID(),
    totalAmount: 3200,
    createdAt: new Date().toISOString(),
    paymentMethod: "credit",
    productId: "prod_002",
    quantity: 1,
  },
  {
    id: crypto.randomUUID(),
    totalAmount: 2750,
    createdAt: new Date().toISOString(),
    paymentMethod: "gcash",
    productId: "prod_003",
    quantity: 3,
  },
]);

  await db.insert(CashClosures).values([
    {
      id: crypto.randomUUID(),
      shift: "Morning",
      userId: "user-001",
      startTime: Date.now() - 4 * 60 * 60 * 1000, // hace 4 horas
      endTime: Date.now(),
      totalCash: 150.75,
      totalCredit: 200.00,
      totalDebit: 50.25,
      totalTransfer: 100.00,
      totalGcash: 80.00,
      totalSales: 581.00,
      declaredCash: 150.00,
      diff: -0.75,
      notes: "Caja cuadró con leve diferencia.",
      createdAt: new Date().toISOString(),
    }
  ]);

  

	await db.insert(Role).values(roles);
	await db.insert(User).values([johnDoe, joahnDoe	]);

	console.log('✅ DB con datos iniciales.');
}