interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}
    >
      {children}
    </div>
  );
}
