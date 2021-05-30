import { Result } from "../core/Result";

function fallbackCopyTextToClipboard(text: any): Result<void> {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
    return Result.fail(err);
  }

  document.body.removeChild(textArea);
  return Result.ok();
}

export async function copyTextToClipboard(text: string): Promise<Result<void>> {
  if (!navigator.clipboard) {
    return fallbackCopyTextToClipboard(text);
  }
  return await new Promise((res) => {
    navigator.clipboard.writeText(text).then(
      function () {
        console.log("Async: Copying to clipboard was successful!");
        return res(Result.ok());
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
        return res(Result.fail(err));
      }
    );
  });
}
