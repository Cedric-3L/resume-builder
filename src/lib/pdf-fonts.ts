import { Font } from "@react-pdf/renderer";

let registered = false;

export function ensurePdfFont() {
  if (registered) return;
  Font.register({
    family: "Noto Sans SC",
    fonts: [
      {
        src: "/fonts/noto-sans-sc-regular.otf",
        fontWeight: 400,
      },
      {
        src: "/fonts/noto-sans-sc-bold.otf",
        fontWeight: 700,
      },
    ],
  });
  registered = true;
}
