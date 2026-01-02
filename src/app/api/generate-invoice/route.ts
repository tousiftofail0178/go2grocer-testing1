
import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getStore } from '@netlify/blobs';
import { db } from '@/db';
import { invoices } from '@/db/schema';
import * as fs from 'fs';
import * as path from 'path';

// Helper to get config reliably
function getNetlifyConfig() {
    let siteID = process.env.NETLIFY_SITE_ID;
    let token = process.env.NETLIFY_AUTH_TOKEN;
    const logs: string[] = [];

    if (!siteID || !token) {
        try {
            // Try explicit path first (Windows style as seen in context), then relative to cwd
            const possiblePaths = [
                'e:/Go2Grocer/G2G_Emergent1/.env.local',
                path.join(process.cwd(), '.env.local'),
                path.join(process.cwd(), '..', '.env.local') // In case cwd is inside src
            ];

            for (const envPath of possiblePaths) {
                logs.push(`Checking path: ${envPath}`);
                if (fs.existsSync(envPath)) {
                    logs.push(`File exists: ${envPath}`);
                    const contentRaw = fs.readFileSync(envPath, 'utf-8');
                    const content = contentRaw.replace(/^\uFEFF/, '');
                    logs.push(`Content read (len: ${content.length}, charCodeAt0: ${content.charCodeAt(0)})`);

                    const lines = content.split(/\r?\n/);
                    logs.push(`Parsing ${lines.length} lines`);

                    for (const line of lines) {
                        const trimmed = line.trim();
                        logs.push(`Line: ${trimmed.substring(0, 30)}...`);
                        // Handle simple KEY=VALUE
                        if (trimmed.startsWith('NETLIFY_SITE_ID=')) {
                            const parts = trimmed.split('=');
                            // Handle cases with multiple = (though unlikely for these keys)
                            const val = parts.slice(1).join('=');
                            if (val) {
                                siteID = val.trim().replace(/^["']|["']$/g, ''); // Remove quotes
                                logs.push(`Found SiteID in file: ${siteID.substring(0, 5)}...`);
                            }
                        }
                        if (trimmed.startsWith('NETLIFY_AUTH_TOKEN=')) {
                            const parts = trimmed.split('=');
                            const val = parts.slice(1).join('=');
                            if (val) {
                                token = val.trim().replace(/^["']|["']$/g, ''); // Remove quotes
                                logs.push(`Found Token in file: ${token.substring(0, 5)}...`);
                            }
                        }
                    }

                    if (siteID && token) break;
                } else {
                    logs.push(`File not found at: ${envPath}`);
                }
            }
        } catch (e: any) {
            logs.push(`Config read error: ${e.message}`);
        }
    } else {
        logs.push('Env vars found in process.env');
    }

    return { siteID, token, logs };
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { order_id, customer, items } = body;

        // 1. Validation
        if (!order_id || !customer || !items || !Array.isArray(items)) {
            return NextResponse.json(
                { success: false, error: 'Invalid input. Required: order_id, customer, items[]' },
                { status: 400 }
            );
        }

        // 2. Generate PDF
        // 2. Generate PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const primaryColor = rgb(0.2, 0.6, 0.2); // Greenish
        const black = rgb(0, 0, 0);
        const gray = rgb(0.5, 0.5, 0.5);

        // -- LOGO -- (Disabled for now to avoid issues)
        // Logo loading can cause issues if file is missing
        /*
        try {
            const logoPath = path.join(process.cwd(), 'public', 'logo.png');
            if (fs.existsSync(logoPath)) {
                const logoBytes = fs.readFileSync(logoPath);
                const logoImage = await pdfDoc.embedPng(logoBytes);
                const logoDims = logoImage.scale(0.15);
                page.drawImage(logoImage, {
                    x: 50,
                    y: height - 120,
                    width: logoDims.width,
                    height: logoDims.height,
                });
            }
        } catch (e) {
            console.error('Logo load failed', e);
        }
        */

        // -- HEADER RIGHT --
        page.drawText('INVOICE', { x: 400, y: height - 60, size: 20, font: boldFont, color: black });
        page.drawText(`#${order_id}`, { x: 400, y: height - 80, size: 12, font: boldFont, color: gray });
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
        page.drawText(`Date: ${dateStr}`, { x: 400, y: height - 100, size: 10, font: font, color: gray });

        // -- SENDER (Left, below logo) --
        let yPos = height - 160;
        page.drawText('Go2Grocer', { x: 50, y: yPos, size: 14, font: boldFont, color: primaryColor });
        yPos -= 20;
        page.drawText('143 SaifUddin Siddique Lane', { x: 50, y: yPos, size: 10, font, color: black });
        yPos -= 15;
        page.drawText('ReazUddin Bazaar', { x: 50, y: yPos, size: 10, font, color: black });
        yPos -= 15;
        page.drawText('Chittagong 4000', { x: 50, y: yPos, size: 10, font, color: black });

        // -- CLIENT (Right, aligned with sender) --
        yPos = height - 160;
        page.drawText('Bill To:', { x: 350, y: yPos, size: 12, font: boldFont, color: black });
        yPos -= 20;

        // Handle customer details safely
        const cName = customer.name || '';
        const cAddr = customer.address || '';
        const cPhone = customer.phone || '';
        const cEmail = customer.email || '';

        page.drawText(cName, { x: 350, y: yPos, size: 10, font, color: black }); yPos -= 15;
        if (cAddr) { page.drawText(cAddr, { x: 350, y: yPos, size: 10, font, color: black }); yPos -= 15; }
        if (cPhone) { page.drawText(cPhone, { x: 350, y: yPos, size: 10, font, color: black }); yPos -= 15; }
        if (cEmail) { page.drawText(cEmail, { x: 350, y: yPos, size: 10, font, color: black }); yPos -= 15; }

        // -- TABLE HEADER --
        let tableY = height - 280;

        // Background strip for header
        page.drawRectangle({ x: 40, y: tableY - 5, width: 515, height: 25, color: rgb(0.95, 0.95, 0.95) });

        const col1 = 50;  // Item
        const col2 = 300; // Qty
        const col3 = 380; // Price
        const col4 = 480; // Total

        page.drawText('Description / Product', { x: col1, y: tableY + 3, size: 10, font: boldFont });
        page.drawText('Quantity', { x: col2, y: tableY + 3, size: 10, font: boldFont });
        page.drawText('Unit Price', { x: col3, y: tableY + 3, size: 10, font: boldFont });
        page.drawText('Total', { x: col4, y: tableY + 3, size: 10, font: boldFont });

        // Line under header
        page.drawLine({ start: { x: 40, y: tableY - 5 }, end: { x: 555, y: tableY - 5 }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });

        tableY -= 25;

        // -- ITEMS --
        let total = 0;
        for (const item of items) {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 1;
            const itemTotal = price * quantity;
            total += itemTotal;

            // Row lines
            if (tableY < 50) { // New page check (simplified)
                page.drawText('(Continued...)', { x: 50, y: tableY, size: 10, font });
                break;
            }

            const itemName = item.name || 'Item';
            page.drawText(itemName.substring(0, 35) + (itemName.length > 35 ? '...' : ''), { x: col1, y: tableY, size: 10, font });
            page.drawText(quantity.toString(), { x: col2 + 10, y: tableY, size: 10, font });
            page.drawText(`Tk. ${price.toFixed(2)}`, { x: col3, y: tableY, size: 10, font });
            page.drawText(`Tk. ${itemTotal.toFixed(2)}`, { x: col4, y: tableY, size: 10, font });

            // Separator line
            page.drawLine({ start: { x: 40, y: tableY - 8 }, end: { x: 555, y: tableY - 8 }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });

            tableY -= 25;
        }

        // -- TOTALS SECTION --
        tableY -= 10;
        const totalXLabel = 400;
        const totalXVal = 480;

        // VAT (Dummy for now, 0%)
        page.drawText('VAT (0%):', { x: totalXLabel, y: tableY, size: 10, font, color: gray });
        page.drawText('Tk. 0.00', { x: totalXVal, y: tableY, size: 10, font, color: gray });

        tableY -= 20;

        // Grand Total
        page.drawLine({ start: { x: 400, y: tableY + 15 }, end: { x: 555, y: tableY + 15 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
        page.drawText('Total:', { x: totalXLabel, y: tableY, size: 14, font: boldFont, color: black });
        page.drawText(`Tk. ${total.toFixed(2)}`, { x: totalXVal - 10, y: tableY, size: 14, font: boldFont, color: black });

        // -- FOOTER --
        page.drawText('Payment will be made within three months from the issuance of this invoice.', {
            x: 50,
            y: 50,
            size: 8,
            font,
            color: gray
        });

        const pdfBytes = await pdfDoc.save();

        // Log PDF size for debugging
        console.log('Generated PDF size:', pdfBytes.length, 'bytes');

        if (pdfBytes.length < 5000) {
            console.warn('WARNING: PDF is suspiciously small, may be corrupted');
        }

        // For now, just return the PDF directly without storing
        // In production, you would store in database and Netlify Blobs

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="invoice-${order_id}.pdf"`,
                'Content-Length': pdfBytes.length.toString(),
            },
        });

    } catch (error: any) {
        console.error('Invoice generation failed DETAILED:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error: ' + error.message },
            { status: 500 }
        );
    }
}
