import { describe, it, expect } from 'vitest';
import {
  dailyLogSchema,
  loginSchema,
  registerSchema,
  validateForm,
} from './validation';

describe('Zod Form Validation Schemas', () => {
  describe('dailyLogSchema', () => {
    it('should validate a correct daily log successfully', () => {
      const validLog = {
        date: '2026-09-19',
        sleep_hours: 8,
        work_hours: 7.5,
        screen_time: 4,
        exercise_minutes: 30,
        break_minutes: 45,
        meetings: 2,
        social_media_minutes: 30,
        mood_score: 8,
        previous_productivity: 80,
        tasks_planned: 5,
        tasks_completed: 4,
        productivity_score: 85,
      };

      const result = validateForm(dailyLogSchema, validLog);
      expect(result.success).toBe(true);
      expect(result.data.sleep_hours).toBe(8);
      expect(result.data.mood_score).toBe(8);
    });

    it('should fail when sleep hours exceed 24', () => {
      const invalidLog = {
        date: '2026-09-19',
        sleep_hours: 25, // Invalid: > 24
        work_hours: 8,
        screen_time: 4,
        exercise_minutes: 30,
        break_minutes: 60,
        meetings: 2,
        social_media_minutes: 45,
        mood_score: 7,
        previous_productivity: 75,
      };

      const result = validateForm(dailyLogSchema, invalidLog);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Sleep hours cannot exceed 24 hours');
    });

    it('should fail when mood score is outside 1-10', () => {
      const invalidLog = {
        date: '2026-09-19',
        sleep_hours: 7,
        work_hours: 8,
        screen_time: 4,
        exercise_minutes: 30,
        break_minutes: 60,
        meetings: 2,
        social_media_minutes: 45,
        mood_score: 11, // Invalid: > 10
        previous_productivity: 75,
      };

      const result = validateForm(dailyLogSchema, invalidLog);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Mood score must be between 1 and 10');
    });

    it('should fail when negative hours or numbers are provided', () => {
      const invalidLog = {
        date: '2026-09-19',
        sleep_hours: -1,
        work_hours: 8,
        screen_time: 4,
        exercise_minutes: 30,
        break_minutes: 60,
        meetings: 2,
        social_media_minutes: 45,
        mood_score: 5,
        previous_productivity: 75,
      };

      const result = validateForm(dailyLogSchema, invalidLog);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Sleep hours cannot be negative');
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login credentials', () => {
      const validLogin = {
        email: 'alex@example.com',
        password: 'securepassword123',
      };

      const result = validateForm(loginSchema, validLogin);
      expect(result.success).toBe(true);
    });

    it('should fail on invalid email format', () => {
      const invalidLogin = {
        email: 'not-an-email',
        password: 'password123',
      };

      const result = validateForm(loginSchema, invalidLogin);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    it('should fail on short password (< 6 chars)', () => {
      const invalidLogin = {
        email: 'test@example.com',
        password: '123',
      };

      const result = validateForm(loginSchema, invalidLogin);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 6 characters');
    });
  });

  describe('registerSchema', () => {
    it('should validate valid user registration data', () => {
      const validRegister = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      };

      const result = validateForm(registerSchema, validRegister);
      expect(result.success).toBe(true);
    });

    it('should fail when name is too short', () => {
      const invalidRegister = {
        name: 'A',
        email: 'jane@example.com',
        password: 'password123',
      };

      const result = validateForm(registerSchema, invalidRegister);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Name must be at least 2 characters long');
    });
  });
});
