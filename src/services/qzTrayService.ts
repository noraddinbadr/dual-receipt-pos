import { Invoice } from '@/types/pos';

// QZ Tray service for thermal printer integration
// This service handles the connection and printing to thermal printers via QZ Tray

declare global {
  interface Window {
    qz: any;
  }
}

interface QZConfig {
  connection: any;
  printer: string;
}

class QZTrayService {
  private config: QZConfig = {
    connection: null,
    printer: 'tow pilots demo printer'
  };

  // Initialize QZ Tray connection
  async initialize(): Promise<boolean> {
    try {
      // Check if QZ Tray is available
      if (typeof window === 'undefined' || !window.qz) {
        console.warn('QZ Tray is not available. Make sure QZ Tray is installed and running.');
        return false;
      }

      // Connect to QZ Tray
      if (!window.qz.websocket.isActive()) {
        await window.qz.websocket.connect();
      }

      // Get available printers and prefer "Tow Pilots Demo Printer"
      const printers = await window.qz.printers.find();
      console.log('Available printers:', printers);
      
      // Search for "Tow Pilots Demo Printer" with case-insensitive matching
      const preferredPrinter = printers.find(p => 
        p.toLowerCase().includes('tow pilots demo printer') || 
        p.toLowerCase() === 'tow pilots demo printer'
      );
      
      if (preferredPrinter) {
        this.config.printer = preferredPrinter;
        console.log('Selected printer:', preferredPrinter);
      } else if (printers.length > 0) {
        this.config.printer = printers[0];
        console.log('Using default printer:', printers[0]);
      }

      console.log('QZ Tray connected successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize QZ Tray:', error);
      return false;
    }
  }

  // Disconnect from QZ Tray
  async disconnect(): Promise<void> {
    try {
      if (window.qz && window.qz.websocket.isActive()) {
        await window.qz.websocket.disconnect();
      }
    } catch (error) {
      console.error('Failed to disconnect QZ Tray:', error);
    }
  }

  // Generate ESC/POS commands for thermal printer
  private generateESCPOSCommands(invoice: Invoice, language: 'en' | 'ar'): string[] {
    const commands: string[] = [];
    const isRTL = language === 'ar';
    
    // Initialize printer
    commands.push('\x1B\x40'); // Initialize
    
    // Set character set and RTL support for Arabic
    if (isRTL) {
      commands.push('\x1B\x74\x06'); // Arabic character set
      commands.push('\x1B\x61\x02'); // Right align for RTL
    } else {
      commands.push('\x1B\x74\x00'); // Standard character set
      commands.push('\x1B\x61\x00'); // Left align for LTR
    }
    
    // Store header
    commands.push('\x1B\x61\x01'); // Center align
    commands.push('\x1B\x21\x30'); // Double height and width
    commands.push(isRTL ? 'متجر نقطة البيع الحديث' : 'Modern POS Store');
    commands.push('\n\n');
    
    // Reset formatting
    commands.push('\x1B\x21\x00'); // Normal size
    
    // Invoice details
    commands.push('\x1B\x61\x00'); // Left align
    commands.push(`${isRTL ? 'رقم الفاتورة' : 'Invoice'}: ${invoice.number}\n`);
    commands.push(`${isRTL ? 'التاريخ' : 'Date'}: ${invoice.date.toLocaleDateString()}\n`);
    commands.push(`${isRTL ? 'الوقت' : 'Time'}: ${invoice.date.toLocaleTimeString()}\n`);
    commands.push('--------------------------------\n');
    
    // Items
    invoice.items.forEach(item => {
      const name = isRTL ? 
        this.getArabicProductName(item.product.nameKey) : 
        item.product.name;
      const price = `${invoice.currency.symbol}${item.product.price.toFixed(2)}`;
      const total = `${invoice.currency.symbol}${item.subtotal.toFixed(2)}`;
      
      commands.push(`${name}\n`);
      commands.push(`${price} x ${item.quantity} = ${total}\n`);
    });
    
    commands.push('--------------------------------\n');
    
    // Totals
    commands.push(`${isRTL ? 'المجموع الفرعي' : 'Subtotal'}: ${invoice.currency.symbol}${invoice.subtotal.toFixed(2)}\n`);
    commands.push(`${isRTL ? 'الضريبة' : 'Tax'}: ${invoice.currency.symbol}${invoice.tax.toFixed(2)}\n`);
    commands.push('--------------------------------\n');
    commands.push('\x1B\x21\x10'); // Bold
    commands.push(`${isRTL ? 'المجموع' : 'Total'}: ${invoice.currency.symbol}${invoice.total.toFixed(2)}\n`);
    commands.push('\x1B\x21\x00'); // Normal
    
    // Footer
    commands.push('\n');
    commands.push('\x1B\x61\x01'); // Center align
    commands.push(isRTL ? 'شكراً لشرائكم!' : 'Thank you for your purchase!');
    commands.push('\n');
    commands.push(isRTL ? 'نرجو زيارتكم لنا مرة أخرى' : 'Please visit us again');
    commands.push('\n\n\n');
    
    // Cut paper
    commands.push('\x1D\x56\x42\x00'); // Full cut
    
    return commands;
  }

  // Get Arabic product names (simplified mapping)
  private getArabicProductName(nameKey: string): string {
    const arabicNames: { [key: string]: string } = {
      'products.coffee': 'قهوة',
      'products.tea': 'شاي',
      'products.sandwich': 'ساندويتش',
      'products.pastry': 'معجنات',
      'products.juice': 'عصير طازج',
      'products.water': 'ماء',
      'products.cake': 'كيك',
      'products.cookie': 'بسكويت'
    };
    return arabicNames[nameKey] || nameKey;
  }

  // Print invoice to thermal printer
  async printInvoice(invoice: Invoice, language: 'en' | 'ar' = 'en'): Promise<boolean> {
    try {
      const isConnected = await this.initialize();
      if (!isConnected) {
        // Fallback to browser print
        this.printToHTMLFormat(invoice, language);
        return false;
      }

      const commands = this.generateESCPOSCommands(invoice, language);
      const receiptData = commands.join('');

      // Configure printer with raw data type as shown in user's configuration
      const configs = window.qz.configs.create(this.config.printer, {
        encoding: 'UTF-8'
      });

      // Use raw data format as per user's requirements
      const data = [{
        type: 'raw',
        format: 'plain',
        data: receiptData
      }];

      await window.qz.print(configs, data);
      console.log('Invoice printed successfully via QZ Tray');
      return true;
    } catch (error) {
      console.error('Failed to print invoice:', error);
      // Fallback to HTML print
      this.printToHTMLFormat(invoice, language);
      return false;
    }
  }

  // Fallback: Print using browser's print dialog
  private printToHTMLFormat(invoice: Invoice, language: 'en' | 'ar'): void {
    const isRTL = language === 'ar';
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${language}">
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.number}</title>
        <style>
          body { 
            font-family: ${isRTL ? 'Arial, "Traditional Arabic"' : 'Arial, sans-serif'}; 
            max-width: 300px; 
            margin: 0 auto; 
            padding: 20px; 
            font-size: 14px;
          }
          .header { text-align: center; margin-bottom: 20px; }
          .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
          .total { font-weight: bold; font-size: 16px; }
          .footer { text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${isRTL ? 'متجر نقطة البيع الحديث' : 'Modern POS Store'}</div>
          <div>${isRTL ? 'رقم الفاتورة' : 'Invoice'}: ${invoice.number}</div>
          <div>${isRTL ? 'التاريخ' : 'Date'}: ${invoice.date.toLocaleDateString()}</div>
          <div>${isRTL ? 'الوقت' : 'Time'}: ${invoice.date.toLocaleTimeString()}</div>
        </div>
        
        <div class="line"></div>
        
        <div class="items">
          ${invoice.items.map(item => `
            <div>
              <strong>${isRTL ? this.getArabicProductName(item.product.nameKey) : item.product.name}</strong><br>
              ${invoice.currency.symbol}${item.product.price.toFixed(2)} × ${item.quantity} = ${invoice.currency.symbol}${item.subtotal.toFixed(2)}
            </div>
          `).join('<br>')}
        </div>
        
        <div class="line"></div>
        
        <div>
          <div>${isRTL ? 'المجموع الفرعي' : 'Subtotal'}: ${invoice.currency.symbol}${invoice.subtotal.toFixed(2)}</div>
          <div>${isRTL ? 'الضريبة' : 'Tax'}: ${invoice.currency.symbol}${invoice.tax.toFixed(2)}</div>
          <div class="line"></div>
          <div class="total">${isRTL ? 'المجموع' : 'Total'}: ${invoice.currency.symbol}${invoice.total.toFixed(2)}</div>
        </div>
        
        <div class="footer">
          <div><strong>${isRTL ? 'شكراً لشرائكم!' : 'Thank you for your purchase!'}</strong></div>
          <div>${isRTL ? 'نرجو زيارتكم لنا مرة أخرى' : 'Please visit us again'}</div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  // Get available printers
  async getPrinters(): Promise<string[]> {
    try {
      const isConnected = await this.initialize();
      if (!isConnected) return [];
      
      return await window.qz.printers.find();
    } catch (error) {
      console.error('Failed to get printers:', error);
      return [];
    }
  }

  // Set specific printer
  setPrinter(printerName: string): void {
    this.config.printer = printerName;
  }
}

export const qzTrayService = new QZTrayService();