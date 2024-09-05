import { z } from "zod";
import { videoSchema } from "./schemas";
import { AbsoluteFill, Img, Series, staticFile, Audio } from "remotion";
import { loadFont } from "@remotion/google-fonts/Recursive";

type Props = z.infer<typeof videoSchema>;

const { fontFamily } = loadFont();

export const MyComposition = (props: Props) => {
  return (
    <>
      <Audio src={staticFile("music.mp3")} />
      <Series>
        {props.scenes.map((scene) => {
          return (
            <Series.Sequence durationInFrames={30 * 3}>
              <AbsoluteFill
                style={{
                  fontFamily,
                  display: "grid",
                  gridTemplateRows: "1fr 1fr",
                }}
              >
                <Img
                  src={staticFile(scene.imageUrl)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    padding: 20,
                    background: "#FFF",
                    display: "flex",
                    placeContent: "center",
                    placeItems: "center",
                    textAlign: "center",
                    height: "100%",
                    fontSize: 92,
                  }}
                >
                  {scene.caption}
                </p>
              </AbsoluteFill>
            </Series.Sequence>
          );
        })}
      </Series>
    </>
  );
};
