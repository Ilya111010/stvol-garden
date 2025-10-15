import * as QRCode from 'qrcode';

export class QRCodeGenerator {
  static async generateQR(text: string, size: number = 384): Promise<string> {
    try {
      const qrOptions = {
        width: size,
        height: size,
        margin: 2,
        color: {
          dark: '#FF69B4', // Pink color for Stvol Garden branding
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M' as const
      };

      const qrDataURL = await QRCode.toDataURL(text, qrOptions);
      return qrDataURL;
    } catch (error) {
      throw new Error(`QR code generation failed: ${error.message}`);
    }
  }

  static async generateQRBuffer(text: string, size: number = 384): Promise<Buffer> {
    try {
      const qrOptions = {
        width: size,
        height: size,
        margin: 2,
        color: {
          dark: '#FF69B4',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M' as const
      };

      const qrBuffer = await QRCode.toBuffer(text, qrOptions);
      return qrBuffer;
    } catch (error) {
      throw new Error(`QR code generation failed: ${error.message}`);
    }
  }
}