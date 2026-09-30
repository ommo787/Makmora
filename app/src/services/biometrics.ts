import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

/** Face ID / Touch ID / device passcode before approvals. Falls back to "allowed" where the device has none (web previews). */
export async function confirmParent(reason = 'أكّد إنك إنت لتوافق'): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  const has = (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
  if (!has) return true;
  const r = await LocalAuthentication.authenticateAsync({ promptMessage: reason, cancelLabel: 'إلغاء', fallbackLabel: 'استعمل الرمز' });
  return r.success;
}
