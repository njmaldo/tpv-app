import { db, bakery_items, Bakery_itemsImg, Role, User, Suppliers, Purchases, CashClosures, Sales, UserProfile } from "astro:db";
import {v4 as UUID } from 'uuid';
import bcrypt from "bcryptjs";



// https://astro.build/db/seed
export default async function seed() {

const roles = [
  { id: 'admin', name: 'Administrator' },
  { id: 'user', name: 'System User' },
];

// === Datos de Usuarios ===
const johnDoe = {
  id: "2a1e3f8a-c472-4d2d-944f-d007c0b05b38", 
  name: 'John Doe',
  email: 'john@google.com',
  password: bcrypt.hashSync('123456', 10),
  roleId: 'admin',
};

const joahnDoe = {
  id: "6e2b9c3f-5d12-4f7e-a9a0-8a71b12b5a1a", 
  name: 'Joahn Doe',
  email: 'joahn@google.com',
  password: bcrypt.hashSync('123456', 10),
  roleId: 'user',
};

await db.insert(Role).values(roles);
await db.insert(User).values([johnDoe, joahnDoe	]);

await db.insert(UserProfile).values([
    {
      id: "8f4c1a32-7b5d-4c2f-bc81-92a3d41f7e9d",
      userId: "2a1e3f8a-c472-4d2d-944f-d007c0b05b38",
      lastName: "Doe",
      birthDate: new Date("1990-05-15"),
      shift: "Mañana",
      age: 34,
    },
    {
      id: "c2d9a6e7-3b18-45e6-8f9f-5d4a9a0c7e12",
      userId: "6e2b9c3f-5d12-4f7e-a9a0-8a71b12b5a1a",
      lastName: "Doe",
      birthDate: new Date("1995-09-20"),
      shift: "Tarde",
      age: 29,
    },
  ]);

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

  



	console.log('✅ DB con datos iniciales.');
}