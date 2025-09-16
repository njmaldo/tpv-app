import { loginUser, logout, registerUser } from './auth';
import { createPurchase, deletePurchase, listPurchases, updatePurchase } from './compras';
import {
  addBakeryItem, deleteBakeryItem, getActiveProducts,
  getProductsByCategory, toggleActive, updateBakeryItem
} from './products';
import { createCategory, deleteCategory, getCategories } from './products/categories';
import { createSupplier, deleteSupplier, listSuppliers, updateSupplier } from './proveedores';
import { addCashClosure } from './tpv/addCashClosure';
import { getSalesSummary } from './tpv/getSalesSummary';
import { addSale } from './tpv/sales';




export const server = {
  //auth
  registerUser,
  loginUser,
  logout,
  //products
  addBakeryItem,
  updateBakeryItem,
  deleteBakeryItem,
  getActiveProducts,
  getProductsByCategory,
  toggleActive,
  //categories
  getCategories,
  createCategory,
  deleteCategory,
  //TPV 
  addSale,
  addCashClosure,
  getSalesSummary,
  // Proveedores
  createSupplier,
  updateSupplier,
  deleteSupplier,
  listSuppliers,
  // Purchases
  createPurchase,
  updatePurchase,
  deletePurchase,
  listPurchases,
  
}