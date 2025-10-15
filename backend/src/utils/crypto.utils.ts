import * as crypto from 'crypto';

/**
 * CRC-8 calculation for promo code validation
 */
export class CRC8 {
  private static readonly CRC8_TABLE: number[] = CRC8.generateTable();

  private static generateTable(): number[] {
    const table: number[] = [];
    for (let i = 0; i < 256; i++) {
      let crc = i;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x80) {
          crc = (crc << 1) ^ 0x07; // Polynomial x^8 + x^2 + x + 1
        } else {
          crc = crc << 1;
        }
        crc &= 0xFF;
      }
      table[i] = crc;
    }
    return table;
  }

  static calculate(data: string): string {
    let crc = 0x00;
    const bytes = Buffer.from(data, 'utf8');
    
    for (const byte of bytes) {
      crc = CRC8.CRC8_TABLE[crc ^ byte];
    }
    
    return crc.toString(16).padStart(2, '0').toUpperCase();
  }

  static validate(data: string, checksum: string): boolean {
    return CRC8.calculate(data) === checksum.toUpperCase();
  }
}

/**
 * Generate secure promo codes with CRC-8 validation
 */
export class PromoCodeGenerator {
  private static readonly ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  static generate(prefix: string = '', length: number = 8): { code: string; checksum: string } {
    const randomPart = Array.from({ length: length - prefix.length }, () => 
      PromoCodeGenerator.ALPHABET[Math.floor(Math.random() * PromoCodeGenerator.ALPHABET.length)]
    ).join('');
    
    const baseCode = prefix + randomPart;
    const checksum = CRC8.calculate(baseCode);
    const fullCode = baseCode + checksum;
    
    return { code: fullCode, checksum };
  }

  static validateCode(code: string): boolean {
    if (code.length < 3) return false;
    
    const baseCode = code.slice(0, -2);
    const providedChecksum = code.slice(-2);
    
    return CRC8.validate(baseCode, providedChecksum);
  }
}

/**
 * Telegram WebApp data validation
 */
export class TelegramAuth {
  static validateInitData(initData: string, botToken: string): any {
    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      
      if (!hash) {
        throw new Error('No hash provided');
      }

      // Remove hash from params
      urlParams.delete('hash');
      
      // Sort params and create data check string
      const dataCheckArr: string[] = [];
      for (const [key, value] of urlParams.entries()) {
        dataCheckArr.push(`${key}=${value}`);
      }
      dataCheckArr.sort();
      const dataCheckString = dataCheckArr.join('\n');
      
      // Create secret key
      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
      
      // Calculate expected hash
      const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
      
      if (expectedHash !== hash) {
        throw new Error('Invalid hash');
      }

      // Parse user data
      const userData = urlParams.get('user');
      if (!userData) {
        throw new Error('No user data');
      }

      const user = JSON.parse(decodeURIComponent(userData));
      
      // Check auth_date (should be within last 24 hours)
      const authDate = parseInt(urlParams.get('auth_date') || '0');
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (currentTime - authDate > 86400) { // 24 hours
        throw new Error('Data is too old');
      }

      return {
        user,
        auth_date: authDate,
        start_param: urlParams.get('start_param'),
        is_valid: true
      };
    } catch (error) {
      return {
        is_valid: false,
        error: error.message
      };
    }
  }
}