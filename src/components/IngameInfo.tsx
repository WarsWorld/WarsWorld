interface Props {
  iconPath: string;
  value: string | number;
}

export default function IngameInfo({ iconPath, value }: Props) {
  return (
    <div className="@flex @justify-between @items-center @bg-gray-800 ingameInfo">
      {iconPath ? (
        <img src={iconPath} />
      ) : (
        <div className="@h-3 @w-3 @bg-white @rounded-full"></div>
      )}
      <div>{value}</div>
    </div>
  );
}
