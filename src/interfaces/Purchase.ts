export interface Purchase {
  id: string;
  productName: string;
  supplierId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  purchaseDate: string;
  createdAt: string;
}

export interface PurchaseWithSupplier extends Purchase {
  supplierName: string; // Lo trae del join
}