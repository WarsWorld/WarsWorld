type Props = {
  className?: string,
}
export default function OrangeGradientLine({ className } : Props) {
  return (
    <>
      <div className={`@h-1 @w-full @bg-gradient-to-r @from-primary-dark @from-10% @via-primary @to-primary-dark @to-90% ${className}`} />
    </>
  );
}