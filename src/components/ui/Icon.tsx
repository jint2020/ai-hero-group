/*
 * @Description: 
 * @Author: Jin Tang
 * @Date: 2025-11-05 11:18:33
 * @LastEditors: Jin Tang
 * @LastEditTime: 2025-11-05 13:21:25
 */
import React from "react";
import { Icon as IconifyIcon } from "@iconify/react";

interface IconProps {
  /** 图标名称，例如: "dinkie-icons:anyway-fm" */
  icon: string;

  /** 图标尺寸 */
  size?: number | string;

  /** 图标颜色 */
  color?: string;

  /** 自定义类名 */
  className?: string;

  /** 点击事件处理 */
  onClick?: () => void;

  /** 是否可点击 */
  clickable?: boolean;

  /** 旋转角度 */
  rotate?: number;

  /** 水平翻转 */
  flip?: "horizontal" | "vertical";

  /** 图标标题（用于无障碍访问） */
  title?: string;
}

const Icon: React.FC<IconProps> = ({
  icon,
  size = 24,
  color,
  className = "",
  onClick,
  clickable = false,
  rotate,
  flip,
  title,
}) => {
  const baseClasses = clickable ? "cursor-pointer hover:opacity-80 transition-opacity" : "";
  const combinedClasses = `${baseClasses} ${className}`.trim();

  return (
    <span title={title} className="inline-flex">
      <IconifyIcon
        icon={icon}
        width={size}
        height={size}
        color={color}
        className={combinedClasses}
        onClick={onClick}
        style={{
          transform: `${rotate ? `rotate(${rotate}deg)` : ""} ${
            flip === "horizontal" ? "scaleX(-1)" : ""
          } ${flip === "vertical" ? "scaleY(-1)" : ""}`,
        }}
      />
    </span>
  );
};

export default Icon;

// 预设的常用图标尺寸
export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  "2xl": 40,
} as const;

// 预设的常用图标颜色
export const IconColors = {
  primary: "#00f5ff",
  secondary: "#a855f7",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  gray: "#6b7280",
  white: "#ffffff",
} as const;
