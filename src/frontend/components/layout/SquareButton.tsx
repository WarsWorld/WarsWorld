interface Props {
  disabled: boolean;
  onClick: React.MouseEventHandler;
  children: React.ReactNode;
}

export default function SquareButton({ disabled, onClick, children }: Props) {
  return (
    <button
      className={`@rounded @py-1 @px-4 @text-lg @font-semibold @shadow-black/50 @shadow-md ${
        !disabled
          ? "@bg-primary hover:@scale-105 active:@scale-105"
          : "@bg-primary-dark"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
