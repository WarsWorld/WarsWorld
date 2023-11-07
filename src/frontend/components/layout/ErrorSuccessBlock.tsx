interface Props {
  isError?: boolean;
  title: string;
  message?: string;
}

export default function ErrorSuccessBlock({ isError, message, title }: Props) {
  const color = isError ? "@bg-orange-star" : "@bg-green-earth";
  return (
    <>
      <div
        className={`@flex @flex-col @text-center @justify-center ${color}/75 @mx-12 @mb-6 @p-2 @rounded-lg @gap-2`}
      >
        <div className="@flex @text-center @justify-center @items-center">
          <div
            className={`@font-medium @text-3xl ${color} @rounded-full @w-12 @p-1`}
          >
            {isError ? <>✗</> : <>✓</>}
          </div>
          <p className="@text-white @text-center @h-auto @text-2xl @px-4">
            {title}
          </p>
        </div>
        {message && <p>{message}</p>}
      </div>
    </>
  );
}
