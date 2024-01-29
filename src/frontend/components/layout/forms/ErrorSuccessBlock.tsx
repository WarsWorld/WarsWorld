type Props = {
  isError?: boolean;
  title: string;
  message?: string;
  className?: string;
};

export default function ErrorSuccessBlock({ isError, message, title, className }: Props) {
  const color = isError == true ? "@bg-orange-star" : "@bg-green-earth";
  return (
    <div className={className}>
      <div
        className={`@flex @flex-col @text-center @h-full @justify-center ${color}/75 smallscreen:@mx-12 @mb-6 @p-2 @rounded-lg @gap-2`}
      >
        <div className="@flex @text-center @justify-center @items-center">
          <div
            className={`@font-medium @text-2xl smallscreen:@text-3xl ${color} @rounded-full @w-10 smallscreen:@w-12  @p-1`}
          >
            {isError == true ? <>✗</> : <>✓</>}
          </div>
          <p className="@text-white @text-center @h-auto @text-2xl @px-4">{title}</p>
        </div>
        {message !== undefined && <p className="@text-sm">{message}</p>}
      </div>
    </div>
  );
}
