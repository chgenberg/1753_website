// Minimal stub for sybkaService - not used in direct integration
class SybkaService {
  shouldCreateInvoice(status: string, paymentStatus: string): boolean { return false }
  shouldCreateSybkaOrder(status: string, paymentStatus: string): boolean { return false }
  getStatusMapping() { return { team_id: '844', invoice_triggers: [], order_triggers: [] } }
  async createOrder(orderData: any): Promise<{ success: boolean; error: string; order_id?: string }> { 
    return { success: false, error: 'Sybka+ disabled - using direct integration', order_id: '' }
  }
  async testConnection(): Promise<boolean> { return false }
  async getCompletedOrders(): Promise<any[]> { return [] }
}

export const sybkaService = new SybkaService()
export default sybkaService 