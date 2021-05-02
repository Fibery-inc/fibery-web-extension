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
  host?: string;
  onChange: ({ typeId, schema }: { typeId: string; schema: any }) => void;
  value?: string;
}) {
  const { data } = useSchema(host);
  return (
    <label className="flex gap-x-4 justify-between px-4 pb-2" htmlFor="type">
      <span className="flex flex-shrink-0 items-center text-gray-700">
        Type
      </span>
      {data ? (
        <select
          className="min-w-0 w-full mt-0 px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black"
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
      ) : (
        <select
          disabled
          className="disabled:opacity-50 min-w-0 w-full mt-0 px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black"
        >
          <option>Select Type</option>
        </select>
      )}
    </label>
  );
}

function getDefaultDescription() {
  const state = (window as any).fiberyState as any;
  if (!state) {
    return "";
  }
  return [
    state?.url
      ? `[${state?.title ?? "Link to original page"}](${state?.url})`
      : "",
    state?.selection,
  ]
    .filter(Boolean)
    .join("\n");
}

function Form({
  me,
  onSave,
}: {
  me: any;
  onSave: ({ linkToEntity }: { linkToEntity: string }) => void;
}) {
  const [currentWorkspace, setCurrentWorkspace] = useState<string>();
  const [currentType, setCurrentType] = useState<string>();
  const [currentName, setCurrentName] = useState<string>(
    ((window as any).fiberyState as any)?.title || ""
  );
  const [currentDescription, setCurrentDescription] = useState<string>(
    getDefaultDescription()
  );
  const [currentSchema, setCurrentSchema] = useState<any>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { mutate: createEntity } = useCreateEntity();
  const disabled = !Boolean(
    currentType && currentWorkspace && currentName && currentSchema
  );
  return (
    <>
      <div
        className={"place-self-center absolute" + (submitting ? "" : " hidden")}
      >
        <div className={styles.logo + " " + styles.loader} />
      </div>
      <form
        className={"grid grid-cols-1 gap-2" + (submitting ? " opacity-10" : "")}
        onSubmit={(e) => {
          setSubmitting(true);
          e.preventDefault();
          if (currentType && currentWorkspace && currentName && currentSchema) {
            createEntity(
              {
                host: currentWorkspace,
                typeId: currentType,
                entityName: currentName,
                schema: currentSchema,
                description: currentDescription,
              },
              {
                onSuccess({ linkToEntity }) {
                  onSave({ linkToEntity });
                  setCurrentName("");
                  setCurrentDescription("");
                },
                onSettled() {
                  setSubmitting(false);
                },
              }
            );
          }
        }}
      >
        <label className="block px-4" htmlFor="name">
          <span className="text-gray-700">Name</span>
          <input
            className="mt-1 block w-full focus:ring-black focus:border-black"
            value={currentName}
            onChange={(e) => setCurrentName(e.currentTarget.value)}
            type="text"
            name="name"
            id="name"
          />
        </label>
        <label className="block px-4" htmlFor="description">
          <span className="text-gray-700">Description</span>
          <textarea
            className="mt-1 block w-full focus:ring-black focus:border-black"
            value={currentDescription}
            onChange={(e) => {
              setCurrentDescription(e.currentTarget.value);
            }}
            name="description"
            id="description"
            rows={3}
          />
        </label>
        <div className="block px-4">
          <button
            title={disabled ? "Please select workspace and type" : undefined}
            className="disabled:opacity-50 disabled:cursor-default disabled:bg-gray-900 bg-gray-900 hover:bg-gray-700 text-white text-lg leading-6 py-2 px-4 border border-transparent  focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-900 focus:outline-none"
            type="submit"
            disabled={disabled}
          >
            Create Entity
          </button>
        </div>

        <label
          className="flex gap-x-4 justify-between px-4 border-t-2 pt-2"
          htmlFor="workspace"
        >
          <span className="flex text-gray-700 flex-shrink-0 items-center">
            Workspace
          </span>
          <select
            className="min-w-0 w-full mt-0 px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black"
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
        <TypesSelect
          value={currentType}
          onChange={({ typeId, schema }) => {
            setCurrentType(typeId);
            setCurrentSchema(schema);
          }}
          host={currentWorkspace}
        />
        <div className="border-t-2 border-gray-100 flex justify-end">
          <div className="px-4 py-2">{me.email}</div>
        </div>
      </form>
    </>
  );
}

function Content({ me, error }: { me: any; error: any }) {
  const [link, setLink] = useState<string>();
  if (link) {
    return (
      <a
        rel="noreferrer"
        href={link}
        target="_blank"
        className="block place-self-center text-center text-blue-700 hover:opacity-80"
      >
        <div className={styles.logo + " inline-block w-24 h-24"} />
        <span className="block">Open Entity to Fibery</span>
      </a>
    );
  }
  if (error && error.code === 401) {
    return (
      <a
        rel="noreferrer"
        href="https://fibery.io/login"
        target="_blank"
        className="block place-self-center text-center text-blue-700 hover:opacity-80"
      >
        <div className={styles.logo + " inline-block w-24 h-24"} />
        <span className="block">Please login to Fibery</span>
      </a>
    );
  }
  if (error) {
    return error.message;
  }
  if (!me) {
    return (
      <div className="place-self-center">
        <div className={styles.logo + " " + styles.loader} />
      </div>
    );
  }
  return (
    <Form
      onSave={({ linkToEntity }) => {
        setLink(linkToEntity);
      }}
      me={me}
    />
  );
}

function App() {
  const { data: me, error } = useMe();
  return (
    <div
      className={`${
        process.env.NODE_ENV === "development" ? "border border-black" : ""
      } pt-4 mx-auto ${styles.app} grid relative`}
    >
      <Content me={me} error={error} />
    </div>
  );
}

export default App;
