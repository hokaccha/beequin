import type { Setting } from "./setting";
import { getDefaultSetting } from "./setting";

test("getDefaultSetting", () => {
  expect(getDefaultSetting()).toEqual<Setting>({
    editor: {
      mode: "default",
      indent: "2space",
      lineWrapping: false,
    },
    formatter: {
      convertKeywordToUppercase: false,
    },
  });
});
