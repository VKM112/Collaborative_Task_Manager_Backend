import prisma from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password.util';

export async function registerUser(data: { name: string; email: string; password: string }) {
  const hashed = await hashPassword(data.password);
  return prisma.user.create({ data: { ...data, password: hashed } });
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const match = await comparePassword(password, user.password);
  return match ? user : null;
}
