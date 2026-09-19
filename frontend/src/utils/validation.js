import { z } from 'zod';

// Login Form Validation Schema
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),
});

// Register Form Validation Schema
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Full name is required' })
    .min(2, { message: 'Name must be at least 2 characters long' }),
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
});

// Daily Log Form Validation Schema
export const dailyLogSchema = z.object({
  date: z
    .string()
    .min(1, { message: 'Date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' }),
  sleep_hours: z.coerce
    .number({ invalid_type_error: 'Sleep hours must be a number' })
    .min(0, { message: 'Sleep hours cannot be negative' })
    .max(24, { message: 'Sleep hours cannot exceed 24 hours' }),
  work_hours: z.coerce
    .number({ invalid_type_error: 'Work hours must be a number' })
    .min(0, { message: 'Work hours cannot be negative' })
    .max(24, { message: 'Work hours cannot exceed 24 hours' }),
  screen_time: z.coerce
    .number({ invalid_type_error: 'Screen time must be a number' })
    .min(0, { message: 'Screen time cannot be negative' })
    .max(24, { message: 'Screen time cannot exceed 24 hours' }),
  exercise_minutes: z.coerce
    .number({ invalid_type_error: 'Exercise minutes must be a number' })
    .min(0, { message: 'Exercise minutes cannot be negative' })
    .max(1440, { message: 'Exercise minutes cannot exceed 1440 minutes' }),
  break_minutes: z.coerce
    .number({ invalid_type_error: 'Break minutes must be a number' })
    .min(0, { message: 'Break minutes cannot be negative' })
    .max(1440, { message: 'Break minutes cannot exceed 1440 minutes' }),
  meetings: z.coerce
    .number({ invalid_type_error: 'Meetings count must be a number' })
    .min(0, { message: 'Meetings count cannot be negative' })
    .max(100, { message: 'Meetings count cannot exceed 100' }),
  social_media_minutes: z.coerce
    .number({ invalid_type_error: 'Social media minutes must be a number' })
    .min(0, { message: 'Social media minutes cannot be negative' })
    .max(1440, { message: 'Social media minutes cannot exceed 1440 minutes' }),
  mood_score: z.coerce
    .number({ invalid_type_error: 'Mood score must be a number' })
    .min(1, { message: 'Mood score must be between 1 and 10' })
    .max(10, { message: 'Mood score must be between 1 and 10' }),
  previous_productivity: z.coerce
    .number({ invalid_type_error: 'Previous productivity must be a number' })
    .min(0, { message: 'Previous productivity must be between 0 and 100%' })
    .max(100, { message: 'Previous productivity cannot exceed 100%' }),
  tasks_planned: z.coerce
    .number({ invalid_type_error: 'Tasks planned must be a number' })
    .min(0, { message: 'Tasks planned cannot be negative' })
    .optional(),
  tasks_completed: z.coerce
    .number({ invalid_type_error: 'Tasks completed must be a number' })
    .min(0, { message: 'Tasks completed cannot be negative' })
    .optional(),
  productivity_score: z.coerce
    .number({ invalid_type_error: 'Productivity score must be a number' })
    .min(0, { message: 'Productivity score must be between 0 and 100%' })
    .max(100, { message: 'Productivity score cannot exceed 100%' })
    .optional(),
});

// Helper function to validate data against any schema and return clean errors
export const validateForm = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error?.issues || result.error?.errors || [];
    const firstErrorMessage = issues[0]?.message || 'Validation failed';
    return {
      success: false,
      error: firstErrorMessage,
      issues,
    };
  }
  return {
    success: true,
    data: result.data,
  };
};
