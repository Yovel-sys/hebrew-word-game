export interface Point {
  x: number;
  y: number;
}

/**
 * מחשבת את מיקומי האותיות סביב מעגל.
 * @param count כמה אותיות
 * @param radius רדיוס המעגל בפיקסלים
 * @param center מרכז המעגל (בד"כ מרכז ה-container)
 */
export function computeCirclePositions(count: number, radius: number, center: Point): Point[] {
  const positions: Point[] = [];
  // מתחילים מלמעלה (זווית -90 מעלות) ומתקדמים עם כיוון השעון
  const startAngle = -90;
  const step = 360 / count;

  for (let i = 0; i < count; i++) {
    const angleDeg = startAngle + i * step;
    const angleRad = (angleDeg * Math.PI) / 180;
    positions.push({
      x: center.x + radius * Math.cos(angleRad),
      y: center.y + radius * Math.sin(angleRad),
    });
  }

  return positions;
}
