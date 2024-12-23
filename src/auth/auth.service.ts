import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../shared/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
/**
   * Validasi pengguna berdasarkan email dan password.
   * @param email - Email pengguna.
   * @param password - Password pengguna.
   * @returns Data pengguna tanpa password jika valid, atau `null` jika tidak valid.
   */
async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null; // Pengguna tidak ditemukan
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const { password, ...result } = user; // Hilangkan password dari hasil
      return result;
    }
    return null;
  }

  /**
   * Login pengguna dan menghasilkan token JWT.
   * @param user - Data pengguna.
   * @returns Objek berisi token akses.
   */
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload), // Buat token JWT
    };
  }

  /**
   * Daftar pengguna baru.
   * @param data - Data pendaftaran pengguna.
   * @throws BadRequestException jika email sudah digunakan.
   * @returns Data pengguna yang baru dibuat.
   */
  async register(data: { email: string; password: string; role: string; companyId: number }) {
    // Periksa apakah email sudah terdaftar
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Hash password dengan bcrypt
    const salt = await bcrypt.genSalt(); // Generate salt
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Buat pengguna baru
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        companyId: data.companyId,
      },
    });
  }
}