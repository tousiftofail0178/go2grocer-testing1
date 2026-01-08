import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData } from '@/types/invoice';
import fs from 'fs';
import path from 'path';

export const generateInvoicePDF = (invoice: InvoiceData): Buffer => {
    const doc = new jsPDF();
    const PAGE_WIDTH = doc.internal.pageSize.width;

    // 1. HEADER - LOGO & BOXES
    doc.setDrawColor(0);
    doc.setFillColor(255, 255, 255);

    // -- LOGO --
    try {
        const logoPath = path.join(process.cwd(), 'public', 'logo.png');
        if (fs.existsSync(logoPath)) {
            const logoFormat = 'PNG'; // Assuming PNG based on filename
            const logoData = fs.readFileSync(logoPath);
            // Sligro logo is top-left, roughly 40-50mm width
            doc.addImage(logoData, logoFormat, 14, 10, 40, 15); // x, y, w, h
        } else {
            // Fallback text if no logo
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("Go2Grocer", 14, 20);
        }
    } catch (e) {
        console.error("Logo load error:", e);
        // Fallback text
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Go2Grocer", 14, 20);
    }

    // Boxes start lower now to accommodate logo
    const boxY = 32;

    // Left Box: Bill To
    doc.rect(14, boxY, 60, 35);
    doc.setFontSize(9);
    doc.text("Bill To:", 16, boxY + 5);
    doc.setFont("helvetica", "bold");
    doc.text(String(invoice.businessName || "Business Customer").substring(0, 25), 16, boxY + 12);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.businessAddress.substring(0, 30), 16, boxY + 18);

    // Middle Box: Deliver To
    doc.rect(78, boxY, 60, 35);
    doc.text("Deliver To:", 80, boxY + 5);
    doc.setFont("helvetica", "bold");
    doc.text(String(invoice.businessName || "Business Customer").substring(0, 25), 80, boxY + 12);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.businessAddress.substring(0, 30), 80, boxY + 18);

    // Right Box: Metadata (Label | Value layout)
    doc.rect(142, boxY, 54, 35);
    doc.setFontSize(8);

    // Row 1
    doc.setFont("helvetica", "bold");
    doc.text("Invoice #:", 144, boxY + 6);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.invoiceNumber, 194, boxY + 6, { align: "right" });

    // Row 2
    doc.setFont("helvetica", "bold");
    doc.text("Date:", 144, boxY + 12);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.date, 194, boxY + 12, { align: "right" });

    // Row 3
    doc.setFont("helvetica", "bold");
    doc.text("Order Ref:", 144, boxY + 18);
    doc.setFont("helvetica", "normal");
    doc.text(String(invoice.orderId), 194, boxY + 18, { align: "right" });

    // Row 4
    doc.setFont("helvetica", "bold");
    doc.text("Customer ID:", 144, boxY + 24);
    doc.setFont("helvetica", "normal");
    // Use real Customer ID (Business ID mapped) or fallback
    doc.text(invoice.customerId || `REL-${String(invoice.orderId).padStart(3, '0')}`, 194, boxY + 24, { align: "right" });

    // 2. THE TABLE DATA
    const tableRows = invoice.items.map(item => [
        item.sku,
        item.description,
        item.quantity,
        item.unit,
        item.size,
        Number(item.unitPrice).toFixed(2),
        Number(item.totalPrice).toFixed(2)
    ]);

    // 3. GENERATE TABLE (Dense & Pro)
    autoTable(doc, {
        startY: boxY + 45,
        head: [['SKU', 'Description', 'Qty', 'Unit', 'Size', 'Price', 'Total']],
        body: tableRows.length > 0 ? tableRows : [['-', 'No Items', 0, '-', '-', '0.00', '0.00']],
        theme: 'grid',
        styles: {
            fontSize: 8,      // Compact font
            cellPadding: 1.5, // Tight padding
            valign: 'middle',
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            textColor: [0, 0, 0]
        },
        headStyles: {
            fillColor: [0, 0, 0],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
        },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 'auto' },
            2: { halign: 'center', cellWidth: 15 },
            3: { halign: 'center', cellWidth: 15 },
            4: { halign: 'center', cellWidth: 15 },
            5: { halign: 'right', cellWidth: 25 }, // Right align
            6: { halign: 'right', cellWidth: 25 }  // Right align
        }
    });

    // 4. YELLOW FOOTER STRIP
    // @ts-ignore
    const finalY = (doc as any).lastAutoTable?.finalY + 10 || 150;

    // Draw Yellow Strip
    doc.setFillColor(255, 204, 0);
    doc.rect(14, finalY, 182, 15, 'F');

    // Text inside Strip
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // Totals calculated or verified
    const displayTotal = Number(invoice.totalAmount).toFixed(2);
    // Calculated total to display if totalAmount is missing or zero (fallback)
    const calculatedTotal = invoice.items.reduce((acc, item) => acc + item.totalPrice, 0).toFixed(2);
    const finalTotalDisplay = Number(displayTotal) > 0 ? displayTotal : calculatedTotal;
    const vat = Number(invoice.vatAmount).toFixed(2);

    // Subtotal
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", 140, finalY + 5);
    doc.text(finalTotalDisplay, 190, finalY + 5, { align: "right" });

    // VAT
    doc.text("VAT (0%):", 140, finalY + 9);
    doc.text(vat, 190, finalY + 9, { align: "right" });

    // Grand Total
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total:", 140, finalY + 14);
    doc.text(`Tk. ${finalTotalDisplay}`, 190, finalY + 14, { align: "right" });

    // Server-Side Return
    return Buffer.from(doc.output('arraybuffer'));
};
