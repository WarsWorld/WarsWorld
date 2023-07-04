import Select, { SelectOption } from "../layout/Select";

const gamemodes = [
  { label: "All", value: 0 },
  { label: "Standard", value: 1 },
  { label: "Fog of War", value: 2 },
  { label: "High Funds", value: 3 },
];
const timeModes = [
  { label: "All", value: 0 },
  { label: "Async", value: 1 },
  { label: "Live", value: 2 },
];

interface Props {
  gamemode: SelectOption | undefined;
  timeMode: SelectOption | undefined;
  setGamemode: React.Dispatch<React.SetStateAction<SelectOption | undefined>>;
  setTimeMode: React.Dispatch<React.SetStateAction<SelectOption | undefined>>;
}

export default function LeaderboardFilters({
  gamemode,
  timeMode,
  setGamemode,
  setTimeMode,
}: Props) {
  return (
    <div className="@grid @gap-6 @grid-cols-2 smallscreen:@grid-cols-3 laptop:@gap-4 laptop:@grid-cols-4 monitor:@grid-cols-6 @mb-8 smallscreen:@mb-12">
      <div className="@w-30 cellphone:@w-40 tablet:@w-56 large_monitor:@w-80 @space-y-2">
        <label>Gamemode</label>
        <Select
          options={gamemodes}
          value={gamemode}
          onChange={(o) => setGamemode(o)}
        />
      </div>
      <div className="@w-30 cellphone:@w-40 tablet:@w-56 large_monitor:@w-80 @space-y-2">
        <label>Time mode</label>
        <Select
          options={timeModes}
          value={timeMode}
          onChange={(o) => setTimeMode(o)}
        />
      </div>
    </div>
  );
}
