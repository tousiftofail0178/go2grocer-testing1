import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
    try {
        console.log('=== CREATING SIMPLE TEST PDF ===');

        // Create a simple PDF
        const pdfDoc = await PDFDocument.create();
        console.log('PDF Document created');

        const page = pdfDoc.addPage([595.28, 841.89]); // A4
        console.log('Page added');

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        console.log('Font embedded');

        // Add some text
        page.drawText('Hello, this is a test PDF!', {
            x: 50,
            y: 750,
            size: 24,
            font: font,
            color: rgb(0, 0, 0),
        });
        console.log('Text drawn');

        const pdfBytes = await pdfDoc.save();
        console.log('PDF saved, size:', pdfBytes.length, 'bytes');
        console.log('First 50 bytes:', pdfBytes.slice(0, 50));

        // Also save to file system for debugging
        const filePath = path.join(process.cwd(), 'test-output.pdf');
        fs.writeFileSync(filePath, pdfBytes);
        console.log('PDF also saved to:', filePath);

        // Return as response
        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="test.pdf"',
                'Content-Length': pdfBytes.length.toString(),
            },
        });
    } catch (error: any) {
        console.error('=== PDF GENERATION FAILED ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
