type Props = {
  children: React.ReactNode;
}

export default function LinkCardContainer({ children }: Props) {
  return (
      <div className="@flex @flex-col @gap-4 desktop:@gap-8 @justify-center @items-center @my-4 smallscreen:@grid smallscreen:@grid-flow-row smallscreen:@grid-cols-2 desktop:@grid-cols-3 monitor:@grid-cols-4 large_monitor:@grid-cols-5">
        {children}
      </div>
  );
}
