import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

export default function Button({ text, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="w-full bg-[#2E90EB] text-white py-2 rounded-lg font-medium hover:bg-[#134848] transition"
    >
      {text}
    </button>
  );
}
