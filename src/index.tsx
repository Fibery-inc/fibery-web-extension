import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { FiberyQueryClientProvider } from "./components/fibery-query-client-provider";
import App from "./components/app";

// // @ts-ignore
// chrome.browserAction.onClicked.addListener((tab) => {
//   // @ts-ignore
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     function: () => {
//       console.log(document.location);
//     },
//   });
// });

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  // @ts-ignore
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

// @ts-ignore
if (typeof chrome !== "undefined" && chrome.action) {
  const isMac = navigator.platform.startsWith("Mac");
  // @ts-ignore
  chrome.action.setTitle({
    title: "Safe To Fibery" + "(".concat(isMac ? "⌘" : "Ctrl", "+Shift+K)"),
  });
}

if (
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
