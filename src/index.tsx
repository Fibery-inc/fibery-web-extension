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

ReactDOM.render(
  <React.StrictMode>
    <FiberyQueryClientProvider>
      <App />
    </FiberyQueryClientProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
