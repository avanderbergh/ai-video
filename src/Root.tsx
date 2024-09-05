import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { videoSchema } from "./schemas";
import video from "../data/video.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={video.scenes.length * 30 * 3}
        fps={30}
        width={1080}
        height={1920}
        schema={videoSchema}
        defaultProps={video}
      />
    </>
  );
};
