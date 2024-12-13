import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Quote } from './quoteService';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const pdfService = {
  async generateQuotePDF(quote: Quote): Promise<Blob> {
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(20);
    doc.text('Orçamento', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Nº: ${quote.number}`, 20, 30);
    doc.text(`Data: ${quote.date.toLocaleDateString()}`, 20, 37);
    
    // Dados do Cliente
    doc.setFontSize(14);
    doc.text('Dados do Cliente', 20, 50);
    doc.setFontSize(12);
    doc.text(`Cliente: ${quote.clientName}`, 20, 60);
    if (quote.clientEmail) doc.text(`Email: ${quote.clientEmail}`, 20, 67);
    if (quote.clientPhone) doc.text(`Telefone: ${quote.clientPhone}`, 20, 74);

    // Tabela de Itens
    const tableRows = quote.items.map(item => [
      item.productName,
      item.quantity.toString(),
      item.unitPrice.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }),
      item.total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
    ]);

    doc.autoTable({
      startY: 85,
      head: [['Produto', 'Qtd', 'Valor Unit.', 'Total']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [25, 118, 210] }
    });

    // Totais
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.text('Subtotal:', 140, finalY);
    doc.text(quote.subtotal.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }), 170, finalY, { align: 'right' });

    if (quote.discount) {
      doc.text('Desconto:', 140, finalY + 7);
      doc.text(quote.discount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }), 170, finalY + 7, { align: 'right' });
    }

    doc.setFontSize(14);
    doc.text('Total:', 140, finalY + 14);
    doc.text(quote.total.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }), 170, finalY + 14, { align: 'right' });

    // Condições
    if (quote.notes) {
      doc.setFontSize(12);
      doc.text('Observações:', 20, finalY + 30);
      doc.setFontSize(10);
      const splitNotes = doc.splitTextToSize(quote.notes, 170);
      doc.text(splitNotes, 20, finalY + 37);
    }

    // Rodapé
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.text('Este orçamento é válido por 15 dias.', 105, pageHeight - 10, { align: 'center' });

    return doc.output('blob');
  }
};
