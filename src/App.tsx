import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

const fiberyUrl = `${process.env.REACT_APP_HOST || ''}/api/commands`;

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

const userQuery = [
  {
    command: "fibery.entity/query",
    args: {
      query: {
        "q/from": "fibery/user",
        "q/select": {
          "fibery/id": "fibery/id",
          "fibery/public-id": "fibery/public-id",
          "user/email": "user/email",
          "user/name": "user/name",
          "fibery/claims": "fibery/claims",
          "fibery/creation-date": "fibery/creation-date",
          "fibery/menu-rank": "fibery/menu-rank",
          "avatar/avatars": {
            "q/from": ["avatar/avatars"],
            "q/select": {
              "fibery/id": "fibery/id",
              "fibery/name": "fibery/name",
              "fibery/content-type": "fibery/content-type",
              "fibery/secret": "fibery/secret",
            },
            "q/limit": "q/no-limit",
          },
          "fibery/favorite-pages": {
            "q/from": ["fibery/favorite-pages"],
            "q/select": {
              "fibery/id": "fibery/id",
              "fibery/pathname": "fibery/pathname",
              "fibery/rank": "fibery/rank",
            },
            "q/limit": "q/no-limit",
          },
          "fibery/Recent~Items": {
            "q/from": ["fibery/Recent~Items"],
            "q/select": {
              "fibery/id": "fibery/id",
              "fibery/timestamp": "fibery/timestamp",
              "fibery/spec": "fibery/spec",
            },
            "q/limit": "q/no-limit",
          },
          "fibery/Notification Rules": {
            "q/from": ["fibery/Notification Rules"],
            "q/select": {
              "fibery/id": "fibery/id",
              "fibery/type": "fibery/type",
            },
            "q/limit": "q/no-limit",
          },
          "fibery/Notifications": {
            "q/from": ["fibery/Notifications"],
            "q/select": {
              "fibery/id": "fibery/id",
              "fibery/timestamp": "fibery/timestamp",
              "fibery/message": "fibery/message",
              "fibery/read": "fibery/read",
            },
            "q/limit": 100,
            "q/order-by": [[["fibery/timestamp"], "q/desc"]],
          },
        },
        "q/where": ["=", ["fibery/id"], "$my-id"],
        "q/limit": 1,
      },
      params: null,
    },
  },
];

function App() {
  const [user, setUser] = useState();
  const [error, setError] = useState();
  useEffect(() => {
    postData(fiberyUrl, userQuery)
      .then((user) => {
        setUser(user);
      })
      .catch((err) => {
        setError(err);
      });
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        {JSON.stringify(user || error)}
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
