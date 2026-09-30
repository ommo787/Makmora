import {
  Backpack, Bed, Bike, Book, BookOpen, CakeSlice, Cat, Clapperboard, Dog, Droplets, FerrisWheel,
  Footprints, Gamepad2, Gift, HandHeart, Headphones, IceCreamCone, Laptop, Moon, Palette, PawPrint,
  Pencil, Pizza, Plane, Popcorn, Puzzle, Shirt, ShowerHead, Smartphone, Sparkles, Sprout, Star,
  Tablet, Tent, Trash2, Trees, ToyBrick, Utensils, Volleyball, Watch,
} from 'lucide-react-native';
import Svg, { Path, Rect } from 'react-native-svg';

export type IconProps = { size?: number; color?: string; strokeWidth?: number };

/** Custom glyphs drawn on the same 24px / 2px grid as Lucide. */
function Toothbrush({ size = 24, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={2} y={15} width={20} height={4} rx={2} />
      <Path d="M14 15v-3M17 15v-4M20 15v-3M6 17h4" />
    </Svg>
  );
}
function Mosque({ size = 24, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 21h18M6 21v-6h12v6M6 15a6 6 0 0 1 12 0M12 9V6.5M12 4.5v.01M10.5 21v-2.5a1.5 1.5 0 0 1 3 0V21" />
    </Svg>
  );
}

const MAP = {
  toothbrush: Toothbrush, mosque: Mosque, bed: Bed, 'book-open': BookOpen, backpack: Backpack, pencil: Pencil,
  'toy-brick': ToyBrick, droplets: Droplets, shirt: Shirt, utensils: Utensils, sprout: Sprout, moon: Moon,
  'paw-print': PawPrint, trash: Trash2, shower: ShowerHead, 'hand-heart': HandHeart, footprints: Footprints,
  volleyball: Volleyball, sparkles: Sparkles, gift: Gift, star: Star,
  gamepad: Gamepad2, tablet: Tablet, smartphone: Smartphone, laptop: Laptop, watch: Watch, headphones: Headphones,
  plane: Plane, 'ferris-wheel': FerrisWheel, tent: Tent, bike: Bike, 'toy-brick-2': ToyBrick, book: Book,
  palette: Palette, cat: Cat, dog: Dog, cake: CakeSlice, puzzle: Puzzle,
  pizza: Pizza, 'ice-cream': IceCreamCone, film: Clapperboard, popcorn: Popcorn, trees: Trees,
} as const;

export type IconName = keyof typeof MAP;

export function Icon({ name, size = 24, color = '#000', strokeWidth = 2 }: IconProps & { name: IconName }) {
  const C = (MAP[name] ?? Sparkles) as React.ComponentType<IconProps>;
  return <C size={size} color={color} strokeWidth={strokeWidth} />;
}
