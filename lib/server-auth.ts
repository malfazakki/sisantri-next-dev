import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface AuthUser {
  userId: string;
  email: string;
  organizationId: string;
  roles: string[];
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    return decoded;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}
