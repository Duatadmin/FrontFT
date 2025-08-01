import { CustomSlider } from './CustomSlider';
import { Ruler, Weight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BiometricInputProps {
  type: 'height' | 'weight';
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

// Conversion functions
const cmToFeetInches = (cm: number) => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches, display: `${feet}'${inches}"` };
};

const feetInchesToCm = (feet: number, inches: number) => {
  return Math.round((feet * 12 + inches) * 2.54);
};

const kgToLbs = (kg: number) => Math.round(kg * 2.20462);
const lbsToKg = (lbs: number) => Math.round(lbs / 2.20462);

export function BiometricInput({ type, value, onChange, className }: BiometricInputProps) {
  const isHeight = type === 'height';
  
  const config = isHeight
    ? {
        icon: <Ruler className="w-5 h-5" />,
        label: 'Height',
        min: 100,
        max: 260,
        step: 1,
        unit: 'cm',
        imperialUnit: 'ft/in',
        tickInterval: 10,
        toImperial: (cm: number) => {
          const { feet, inches } = cmToFeetInches(cm);
          return feet + (inches / 12); // Return as decimal feet for slider
        },
        fromImperial: (decimal: number) => {
          const feet = Math.floor(decimal);
          const inches = Math.round((decimal - feet) * 12);
          return feetInchesToCm(feet, inches);
        },
        formatValue: (val: number) => {
          const { display } = cmToFeetInches(Math.round(val));
          return display;
        },
      }
    : {
        icon: <Weight className="w-5 h-5" />,
        label: 'Weight',
        min: 30,
        max: 200,
        step: 1,
        unit: 'kg',
        imperialUnit: 'lbs',
        tickInterval: 10,
        toImperial: kgToLbs,
        fromImperial: lbsToKg,
      };

  return (
    <div className={cn(
      "relative overflow-hidden",
      "bg-gradient-to-b from-white/[0.08] to-white/[0.02]",
      "backdrop-blur-xl rounded-3xl",
      "border border-white/10",
      "shadow-2xl shadow-black/20",
      "p-8",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-lime/5 via-transparent to-accent-orange/5 opacity-50" />
      
      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-lime/20 to-accent-orange/20 flex items-center justify-center backdrop-blur-sm">
            <span className="text-accent-lime">{config.icon}</span>
          </div>
          <h3 className="text-white font-semibold text-xl tracking-tight">{config.label}</h3>
        </div>
        
        <CustomSlider
          {...config}
          value={value}
          onChange={onChange}
          enableImperial
          showInput
          showButtons
          snapToTicks
        />
        
        {/* Helper text */}
        <div className="mt-10 text-center">
          <p className="text-sm text-white/50 font-medium">
            {isHeight 
              ? "Tip: Use the buttons for precise adjustments" 
              : "We'll use this to track your progress"}
          </p>
        </div>
      </div>
    </div>
  );
}