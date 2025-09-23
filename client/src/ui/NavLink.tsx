import { Link } from "react-router-dom";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function NavLink({ to, children, onClick }: NavLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="text-[#1F2937] hover:text-[#1c7f7f] transition-colors"
    >
      {children}
    </Link>
  );
}
