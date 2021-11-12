import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { FiberyQueryClientProvider } from "./components/fibery-query-client-provider";
import App from "./components/app";

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  // @ts-ignore
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

const isMac = navigator.platform.startsWith("Mac");
const title = "Save To Fibery" + "(".concat(isMac ? "⌘" : "Ctrl", "+Shift+K)");

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
            selection: window?.getSelection()?.toString(),
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
            selection: window?.getSelection()?.toString(),
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
