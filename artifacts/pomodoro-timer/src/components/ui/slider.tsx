import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
}

export function Slider({ label, value, onChange, formatValue, className, ...props }: SliderProps) {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <div className="flex justify-between items-end">
        <label className="text-sm font-medium text-foreground/80">{label}</label>
        <span className="text-sm font-semibold text-primary">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        {...props}
      />
    </div>
  );
}
