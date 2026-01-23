"use client";

import { Button } from "./Button";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  max: string;
  buttonText: string;
  onButtonClick: () => void;
  disabled?: boolean;
}

export function AmountInput({
  value,
  onChange,
  max,
  buttonText,
  onButtonClick,
  disabled = false,
}: AmountInputProps) {
  const isButtonDisabled = disabled || !value || parseFloat(value) <= 0 || parseFloat(value) > parseFloat(max);

  const handleMaxClick = () => {
    onChange(max);
  };

  return (
    <div className="flex flex-row w-full gap-2">
      <div className="relative w-4/6">
        <input
          type="number"
          min={0}
          max={max}
          value={value}
          placeholder="0.0"
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-14 rounded-md text-2xl px-3 font-transformers text-black outline-none"
        />
        <Button
          size="small"
          className="absolute top-2 right-2 w-16"
          onClick={handleMaxClick}
        >
          MAX
        </Button>
      </div>
      <Button
        className="w-2/6"
        disabled={isButtonDisabled}
        onClick={onButtonClick}
      >
        {buttonText}
      </Button>
    </div>
  );
}