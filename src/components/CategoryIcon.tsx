import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { wrapper: "w-9 h-9", icon: 16 },
  md: { wrapper: "w-11 h-11", icon: 20 },
  lg: { wrapper: "w-14 h-14", icon: 24 },
};

export function CategoryIcon({ icon, color, size = "md" }: CategoryIconProps) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[icon] || Icons.Circle;
  const { wrapper, icon: iconSize } = sizeMap[size];

  return (
    <div
      className={`${wrapper} rounded-full flex items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: `${color}26` }} // 15% opacity
    >
      <IconComponent size={iconSize} color={color} strokeWidth={2} />
    </div>
  );
}
