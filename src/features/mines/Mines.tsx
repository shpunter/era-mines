import type { Mine as TMine } from "#/shared/minesBus";
import Mine from "./mine/Mine";
import { useMinesStore } from "./mines.store";
import css from "./mines.module.css";

const Mines = () => {
  const addMine = useMinesStore((state) => state.addMine);

  const onClick = (mine: TMine) => () => {
    addMine(mine);
  };

  return (
    <div className={css.mines}>
      {(["gold", "wood", "ore", "crystals", "gem", "mercury"] as const).map(
        (item) => {
          return <Mine key={item} type={item} onClick={onClick(item)} />;
        },
      )}
    </div>
  );
};

export default Mines;
