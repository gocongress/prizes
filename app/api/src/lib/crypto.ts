import { runtime } from '@/config';
import { customAlphabet } from 'nanoid';

export const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUWXYZ');

export const randomID = (size = runtime.otpCodeLength) => nanoid(size);
