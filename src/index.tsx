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
// @ts-ignore
if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.executeScript) {
  // @ts-ignore
  chrome.tabs.executeScript(
    {
      code:
        "(() => {return { selection: window.getSelection().toString(), title: document.title, url: document.location.toString()};})();",
    },
    function ([{ selection = "", title, url }]: any) {
      // @ts-ignore
      window.fiberyState = {
        selection,
        title,
        url,
      };
    }
  );
}

ReactDOM.render(
  <React.StrictMode>
    <FiberyQueryClientProvider>
      <App />
    </FiberyQueryClientProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
