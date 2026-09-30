import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

/**
 * Pick a photo from the phone, square it, and shrink it to a small picture the whole family's devices can share.
 * Returns a data URI (about 20 KB), or null if cancelled.
 */
export async function pickPhoto(): Promise<string | null> {
  const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 });
  if (r.canceled || !r.assets?.[0]) return null;
  const a = r.assets[0];
  const side = Math.min(a.width || 256, a.height || 256);
  const ctx = ImageManipulator.manipulate(a.uri);
  if (a.width && a.height && a.width !== a.height) {
    ctx.crop({ originX: (a.width - side) / 2, originY: (a.height - side) / 2, width: side, height: side });
  }
  ctx.resize({ width: 256, height: 256 });
  const img = await ctx.renderAsync();
  const out = await img.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
  return out.base64 ? `data:image/jpeg;base64,${out.base64}` : out.uri;
}
