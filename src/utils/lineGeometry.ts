import { Point } from './circleLayout';

export interface LineStyle {
  left: number;
  top: number;
  width: number;
  transform: { rotate: string }[];
  transformOrigin: string;
}

/**
 * מחשבת סטייל ל-View דק שמחבר בין שתי נקודות - זו הדרך לצייר "קו"
 * ב-React Native בלי ספריית SVG: View ברוחב = המרחק בין הנקודות,
 * מסובב בזווית הנכונה, וממוקם כך שהקצה השמאלי שלו יושב על הנקודה הראשונה.
 *
 * חשוב: React Native מסובב סביב מרכז ה-View כברירת מחדל, אז בלי
 * transformOrigin מפורש הקו "יברח" מנקודת ההתחלה בכל זווית שאינה 0.
 */
export function computeLineStyle(from: Point, to: Point, thickness: number): LineStyle {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    left: from.x,
    top: from.y - thickness / 2,
    width: distance,
    transform: [{ rotate: `${angleDeg}deg` }],
    transformOrigin: '0% 50%',
  };
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
