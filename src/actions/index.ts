import {login,logout, register } from './auth';
import { createPurchase, deletePurchase, 
         listPurchases, updatePurchase } from './compras';
import {listEmployees,deleteEmployee, getEmployeeActive, toggleEmployeeActive, updateEmployee, createEmployee } from './employees';
import {
  addBakeryItem, deleteBakeryItem, getActiveProducts,
  getProductsByCategory, toggleActive, updateBakeryItem
} from './products';
import { createCategory, deleteCategory, listCategories } from './products/categories';

import { createSupplier, deleteSupplier, listSuppliers, updateSupplier } from './proveedores';
import { checkCashClosure } from './tpv/checkCashClosure';
import { checkOpenShift } from './tpv/checkOpenShift';
import { closeShift } from './tpv/closeShift';
import { getEmployees } from './tpv/employees';
import { getSalesSummary } from './tpv/getSalesSummary';
import { openShift } from './tpv/openShift';
import { addSale } from './tpv/sales';




export const server = {
  //auth
  register,
  login,
  logout,
  // Empleados
  createEmployee,
  listEmployees,
  toggleEmployeeActive,
  deleteEmployee,
  updateEmployee,
  getEmployeeActive,
  //products
  addBakeryItem,
  updateBakeryItem,
  deleteBakeryItem,
  getActiveProducts,
  getProductsByCategory,
  toggleActive,
  //categories
  listCategories,
  createCategory,
  deleteCategory,
  //TPV 
  addSale,
  checkCashClosure,
  checkOpenShift,
  getSalesSummary,
  openShift,
  closeShift,
  getEmployees,
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