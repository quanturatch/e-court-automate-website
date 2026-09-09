"use client";

import { useState } from "react";

export default function CopyCommand({ text }: { text: string }) {
  const [ok, setOk] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setOk(true);
      setTimeout(() => setOk(false), 1600);
    } catch {
      setOk(false);
    }
  }

  return (
    <div className="cmd">
      <code>{text}</code>
      <button className="copy" type="button" onClick={copy}>
        {ok ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
