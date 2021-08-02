import { Result } from "../core/Result";
import {logger} from "../../logger"

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
    logger.info("Fallback: Copying text command was " + msg);
  } catch (err) {
    logger.error({error : err}, "Fallback: Oops, unable to copy %s", err);
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
        logger.info("Async: Copying to clipboard was successful!");
        return res(Result.ok());
      },
      function (err) {
        logger.error({error : err}, "Async: Could not copy text: %s", err);
        return res(Result.fail(err));
      }
    );
  });
}
