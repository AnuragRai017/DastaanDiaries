// Use browser's native Web Crypto API
const CLOUDINARY_API_SECRET = 'Hh6uEpolDKMYw4L1C0Aa3rKiQEY'; // Replace with your actual API secret

export async function generateSignature(timestamp: string): Promise<string> {
  try {
    // Create the string to sign according to Cloudinary's requirements
    const str = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Error generating signature:', error);
    throw error;
  }
}
