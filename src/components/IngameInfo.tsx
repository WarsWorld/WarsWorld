interface Props {
  iconPath: string;
  ingameStat: string | number;
}

export function IngameInfo({ iconPath, ingameStat }: Props) {
  return (
    <div className="@flex @justify-between @items-center @bg-gray-800 ingameInfo">
      {iconPath ? (
        <img src={iconPath} />
      ) : (
        <div className="@h-3 @w-3 @bg-white @rounded-full"></div>
      )}
      <div>{ingameStat}</div>
    </div>
  );
}
