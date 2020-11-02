import React, { useEffect, useState } from "react";
import styles from "./App.module.css";
import { getMe } from "./api";

function App() {
  const [me, setMe] = useState({ email: ``, workspaces: [] });
  const [error, setError] = useState();
  useEffect(() => {
    getMe()
      .then((user) => {
        setMe(user);
      })
      .catch((err) => {
        setError(err);
      });
  }, []);
  return (
    <div className={styles.app}>
      {error ? JSON.stringify(error) : null}
      <label htmlFor="workspaces">
        workspaces
        <select name="workspaces" id="workspaces">
          {me.workspaces.map(({ name }) => (
            <option value={name}>{name}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default App;
