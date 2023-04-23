interface Props {
  ingameStatIconPath: string;
  ingameStat: string | number;
}

export function IngameInfo({ ingameStatIconPath, ingameStat }: Props) {
  return (
    <div className="@flex @justify-between @items-center @bg-gray-800 ingameInfo">
      {ingameStatIconPath ? (
        <img src={ingameStatIconPath} />
      ) : (
        <div className="@h-3 @w-3 @bg-white @rounded-full"></div>
      )}
      <div>{ingameStat}</div>
    </div>
  );
}
