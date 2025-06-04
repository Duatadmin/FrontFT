import { ArrowUpRight } from 'lucide-react'; // Using ArrowUpRight as a common send icon

interface SendButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const SendButton: React.FC<SendButtonProps> = ({
  onClick,
  disabled,
  className,
}) => {
  return (
    <button
      type="button" // Or type="submit" if it's part of a form and that's desired
      onClick={onClick}
      disabled={disabled}
      aria-label="Send message"
      className={`p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 active:bg-slate-700 transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <ArrowUpRight size={22} aria-hidden="true" />
    </button>
  );
};
