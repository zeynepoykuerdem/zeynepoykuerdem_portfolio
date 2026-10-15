"use client";
import { useState } from "react";

const EMAIL = "zeynepoykuerdem@outlook.com";

export default function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      setMessage("Select the address above and copy it.");
    }
  }
  return (
    <>
      <button type="button" className="ghost" onClick={copyEmail}>
        {copied ? "Copied!" : "Copy email"}
      </button>
      <span className="status">{message}</span>
    </>
  );
}
