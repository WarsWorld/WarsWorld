interface Props {
  disabled?: boolean;
  onClick?: React.MouseEventHandler;
  children: React.ReactNode;
}

export default function SquareButton({ disabled, onClick, children }: Props) {
  return (
    <button
      className={`@rounded @w-full @h-full @py-1 @px-3 cellphone:@px-4 @text-inherit @font-semibold @shadow-black/50 @shadow-md ${
        !disabled
          ? "@bg-primary hover:@scale-[1.025] active:@scale-105"
          : "@bg-primary-dark"
      } active:@bg-primary-dark`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
