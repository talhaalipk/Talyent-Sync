import { Link } from "react-router-dom";

interface ButtonLinkProps {
  to: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string; // Add className prop to the interface
}

export default function ButtonLink({
  to,
  children,
  variant = "primary",
  fullWidth = false,
  onClick,
  className = "", // Provide a default empty string for className
}: ButtonLinkProps) {
  const base = "px-4 py-2 rounded-xl font-medium transition-colors shadow-sm text-center";
  const styles =
    variant === "primary"
      ? "bg-[#2E90EB] text-white hover:bg-blue-600"
      : "text-[#2E90EB] border border-[#2E90EB] hover:bg-[#2E90EB] hover:text-white";

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`${base} ${styles} ${fullWidth ? "block w-full" : ""} ${className}`}
    >
      {children}
    </Link>
  );
}
