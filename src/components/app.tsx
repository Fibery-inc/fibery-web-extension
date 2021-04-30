import { useState } from "react";
import styles from "./app.module.css";
import { useCreateEntity, useMe, useSchema } from "../api/fetcher";

function getTypes(schema: any) {
  return schema["fibery/types"]
    .filter((type: any) => {
      return (
        type["fibery/meta"]["fibery/domain?"] &&
        type["fibery/name"] !== "fibery/user"
      );
    })
    .map((type: any) => {
      return { id: type["fibery/id"], name: type["fibery/name"] };
    });
}

function TypesSelect({
  host,
  onChange,
  value,
}: {
  host: string;
  onChange: ({ typeId, schema }: { typeId: string; schema: any }) => void;
  value?: string;
}) {
  const { data } = useSchema(host);
  return data ? (
    <div className={styles.field}>
      <label htmlFor="type">
        Type:
        <br />
        <select
          value={value}
          onChange={(e) =>
            onChange({
              typeId: e.currentTarget.value,
              schema: (data as any)[0].result,
            })
          }
          name="type"
          id="type"
        >
          <option>Select Type</option>
          {getTypes((data as any)[0].result).map((type: any) => {
            return (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            );
          })}
        </select>
      </label>
    </div>
  ) : (
    <>loading....</>
  );
}

function getDefaultDescription() {
  const state = (window as any).fiberyState as any;
  if (!state) {
    return "";
  }
  return `${state?.selection}
  
[${state?.title}](${state?.url})
`;
}

function Form({ me }: { me: any }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<string>();
  const [currentType, setCurrentType] = useState<string>();
  const [currentName, setCurrentName] = useState<string>(
    ((window as any).fiberyState as any)?.title || ""
  );
  const [currentDescription, setCurrentDescription] = useState<string>(
    getDefaultDescription()
  );
  const [currentSchema, setCurrentSchema] = useState<any>();
  const { mutate: createEntity } = useCreateEntity();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (currentWorkspace && currentType && currentName && currentSchema) {
          createEntity(
            {
              host: currentWorkspace,
              typeId: currentType,
              entityName: currentName,
              schema: currentSchema,
              description: currentDescription,
            },
            {
              onSuccess() {
                setCurrentName("");
                setCurrentDescription("");
              },
            }
          );
        }
      }}
    >
      <div className={styles.field}>
        <label htmlFor="workspace">
          Workspace:
          <br />
          <select
            onChange={(e) => setCurrentWorkspace(e.currentTarget.value)}
            value={currentWorkspace}
            name="workspace"
            id="workspace"
          >
            <option>Select Workspace</option>
            {me.workspaces.map(({ name }: { name: any }) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {currentWorkspace ? (
        <TypesSelect
          value={currentType}
          onChange={({ typeId, schema }) => {
            setCurrentType(typeId);
            setCurrentSchema(schema);
          }}
          host={currentWorkspace}
        />
      ) : null}
      {currentType && currentWorkspace ? (
        <>
          <div className={styles.field}>
            <label htmlFor="name">
              Name:
              <br />
              <input
                value={currentName}
                onChange={(e) => setCurrentName(e.currentTarget.value)}
                type="text"
                name="name"
                id="name"
              />
            </label>
          </div>
          <div className={styles.field}>
            <label htmlFor="description">
              Description:
              <br />
              <textarea
                value={currentDescription}
                onChange={(e) => {
                  setCurrentDescription(e.currentTarget.value);
                }}
                name="description"
                id="description"
                cols={30}
                rows={10}
              />
            </label>
          </div>
        </>
      ) : null}
      <div>
        <button
          type="submit"
          disabled={
            !Boolean(
              currentType && currentWorkspace && currentName && currentSchema
            )
          }
        >
          Create Entity
        </button>
      </div>
    </form>
  );
}

function getContent({ me, error }: { me: any; error: any }) {
  if (error) {
    return error.message;
  }
  if (!me) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <div className={styles.login}>{me.email}</div>
      <Form me={me} />
    </>
  );
}

function App() {
  const { data: me, error } = useMe();
  return <div className={styles.app}>{getContent({ me, error })}</div>;
}

export default App;
