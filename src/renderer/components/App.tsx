import type { FC } from "react";
import { useEffect, useState } from "react";

import { ipc } from "~/lib/ipc";

export const App: FC = () => {
  const [query, setQuery] = useState("");
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
  };

  const handleClick = async () => {
    const response = await ipc.invoke.executeQuery(query);
    console.log(response);
  };

  useEffect(() => {
    ipc.on.executeQueryFromMenu(() => {
      console.log("menu item clicked");
    });
  }, []);

  return (
    <div>
      <textarea onChange={handleTextChange} />
      <button onClick={handleClick}>submit</button>
    </div>
  );
};
