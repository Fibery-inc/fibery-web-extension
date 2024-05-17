import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { FiberyQueryClientProvider } from "./components/fibery-query-client-provider";
import App from "./components/app";

async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  // @ts-ignore
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

const isMac = navigator.platform.startsWith("Mac");
const title = "Save To Fibery" + "(".concat(isMac ? "⌘" : "Ctrl", "+Shift+K)");

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (typeof browser !== "undefined" && browser.browserAction) {
  // @ts-ignore
  browser.browserAction.setTitle({ title });
  // @ts-ignore
} else if (typeof chrome !== "undefined" && chrome.action) {
  // @ts-ignore
  chrome.action.setTitle({
    title,
  });
}
// @ts-ignore
if (typeof browser !== "undefined" && browser.tabs) {
  (async () => {
    try {
      // @ts-ignore
      const [info] = await browser.tabs.executeScript({
        code: `var info = {
            // @ts-ignore
            selection: (() => {
              function getSelectionHtml() {
                var html = "";
                if (typeof window.getSelection != "undefined") {
                    var sel = window.getSelection();
                    if (sel.rangeCount) {
                        var container = document.createElement("div");
                        for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                            container.appendChild(sel.getRangeAt(i).cloneContents());
                        }
                        html = container.innerHTML;
                    }
                } else if (typeof document.selection != "undefined") {
                    if (document.selection.type == "Text") {
                        html = document.selection.createRange().htmlText;
                    }
                }
                return html;
              }
              return getSelectionHtml();
            })(),
            title: document.title,
            url: document.location.toString(),
          };info`,
      });
      // @ts-ignore
      window.fiberyState = info;
    } catch (e) {
      console.error(e);
    }
  })();
} else if (
  // @ts-ignore
  typeof chrome !== "undefined" &&
  // @ts-ignore
  chrome.scripting &&
  // @ts-ignore
  chrome.scripting.executeScript
) {
  (async () => {
    try {
      const tab = await getCurrentTab();
      // @ts-ignore
      const [{ result: tabData }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          return {
            // @ts-ignore
            selection: (() => {
              function getSelectionHtml() {
                let html = "";
                if (typeof window.getSelection != "undefined") {
                  const sel = window.getSelection();
                  // @ts-ignore
                  if (sel.rangeCount) {
                    const container = document.createElement("div");
                    // @ts-ignore
                    for (let i = 0, len = sel.rangeCount; i < len; ++i) {
                      // @ts-ignore
                      container.appendChild(sel.getRangeAt(i).cloneContents());
                    }
                    html = container.innerHTML;
                  }
                }
                return html;
              }
              return getSelectionHtml();
            })(),
            title: document.title,
            url: document.location.toString(),
          };
        },
      });
      // @ts-ignore
      window.fiberyState = tabData;
    } catch (e) {
      console.error(e);
    }
  })();
}

ReactDOM.render(
  <React.StrictMode>
    <FiberyQueryClientProvider>
      <App />
    </FiberyQueryClientProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
