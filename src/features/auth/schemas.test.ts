import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './schemas';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'secret' });
    expect(result.success).toBe(true);
  });

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/valid email/i);
    }
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const base = {
    fullName: 'George Marriott',
    email: 'george@eaglebank.test',
    phone: '+44 7700 900000',
    password: 'password123',
  };

  it('accepts a fully valid payload', () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ ...base, password: 'Pass1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/at least 8/i);
    }
  });

  it('requires a number', () => {
    const result = registerSchema.safeParse({ ...base, password: 'Passwordabc' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => /number/i.test(i.message))).toBe(true);
    }
  });

  it('rejects a too-short name', () => {
    const result = registerSchema.safeParse({ ...base, fullName: 'A' });
    expect(result.success).toBe(false);
  });
});
