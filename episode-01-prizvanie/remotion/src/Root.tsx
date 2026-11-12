import { Composition } from "remotion";
import Main from "./Composition";
import { DURATION_IN_FRAMES } from "./data";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Main"
      component={Main}
      durationInFrames={DURATION_IN_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

export default RemotionRoot;
