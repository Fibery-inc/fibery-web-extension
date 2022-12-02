import { useState, useRef, useEffect } from "react";
import styles from "./app.module.css";
import { useCreateEntity, useMe, useSchema } from "../api/fetcher";
import { User, Schema } from "../types";
import { AppError } from "../api/api-call";
import { getTypeName } from "../api/get-type-name";

const isMac = navigator?.platform?.startsWith("Mac");

const typeTerm = "Database";

function Shortcuts() {
  if (isMac) {
    return (
      <span className="px-4 py-2 text-gray-400">
        <span className="bg-gray-100 rounded p-0.5 mr-1 text-xs">⌘</span>+
        <span className="bg-gray-100 rounded p-0.5 mr-1 ml-1 text-xs">
          Shift
        </span>
        +<span className="bg-gray-100 rounded p-0.5 ml-1 text-xs">K</span>
      </span>
    );
  }
  return (
    <span className="px-4 py-2">
      <span className="px-4 py-2 text-gray-400">
        <span className="bg-gray-100 rounded p-0.5 mr-1 text-xs">Ctrl</span>+
        <span className="bg-gray-100 rounded p-0.5 mr-1 ml-1 text-xs">
          Shift
        </span>
        +<span className="bg-gray-100 rounded p-0.5 ml-1 text-xs">K</span>
      </span>
    </span>
  );
}

function getTypes(schema: Schema) {
  const typesByGroup: Array<{
    groupLabel: string;
    types: Array<{ name: string; id: string }>;
  }> = [];
  const indexByGroup: Record<string, number> = {};
  let index = 0;
  for (const type of schema["fibery/types"]) {
    if (
      type["fibery/meta"]["fibery/domain?"] &&
      type["fibery/name"] !== "fibery/user" &&
      !type["fibery/meta"]["sync/source"]
    ) {
      const [groupLabel, name] = type["fibery/name"].split("/");
      const typeOption = { id: type["fibery/id"], name };
      const groupIndex = indexByGroup[groupLabel];
      if (groupIndex !== undefined && typesByGroup[groupIndex]) {
        typesByGroup[groupIndex].types.push(typeOption);
      } else {
        typesByGroup[index] = { groupLabel: groupLabel, types: [typeOption] };
        indexByGroup[groupLabel] = index;
        index++;
      }
    }
  }
  return typesByGroup;
}

function getWorkspaceName(host: string) {
  const [name] = host.split(".");
  return name;
}

function TypesSelect({
  onChange,
  value,
  schema,
}: {
  onChange: ({ typeId }: { typeId: string }) => void;
  value?: string;
  schema?: Schema;
}) {
  return (
    <label
      className="flex gap-x-4 justify-between border-gray-100 px-4"
      htmlFor="type"
    >
      <span className="flex flex-shrink-0 items-center text-gray-500">
        {typeTerm}
      </span>
      {schema ? (
        <select
          className="min-w-0 w-56 text-sm mt-0 border-0 rounded focus:bg-gray-100 focus:ring-offset-0 focus:border-gray-100 focus:ring-gray-100 focus:ring-gray-100 focus:outline-none"
          value={value}
          onChange={(e) =>
            onChange({
              typeId: e.currentTarget.value,
            })
          }
          name="type"
          id="type"
        >
          <option value="">Select {typeTerm}</option>
          {getTypes(schema).map(({ groupLabel, types }) => {
            return (
              <optgroup key={groupLabel} label={groupLabel}>
                {types
                  .filter((type) => false === type.name.endsWith("_deleted"))
                  .map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
              </optgroup>
            );
          })}
        </select>
      ) : (
        <select
          disabled
          className="disabled:opacity-50 min-w-0 w-56 text-sm mt-0 border-0 rounded focus:bg-gray-100 focus:ring-offset-0 focus:border-gray-100 focus:ring-gray-100 focus:ring-gray-100 focus:outline-none"
        >
          <option>Select {typeTerm}</option>
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
    .join("\n\n");
}

function Form({
  me,
  onSave,
}: {
  me: User;
  onSave: ({
    linkToEntity,
    typeName,
  }: {
    linkToEntity: string;
    typeName: string;
  }) => void;
}) {
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const inputNameRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [currentWorkspace, setCurrentWorkspace] = useState<string | undefined>(
    me.lastUsedWorkspace
  );
  const [currentType, setCurrentType] = useState<string | undefined>(
    me.lastUsedType
  );
  const [currentName, setCurrentName] = useState<string>(
    ((window as any).fiberyState as any)?.title || ""
  );
  const [currentDescription, setCurrentDescription] = useState<string>(
    getDefaultDescription()
  );
  const { data: schema } = useSchema(currentWorkspace);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { mutate: createEntity } = useCreateEntity();
  const disabled = !(currentType && currentWorkspace && currentName && schema);
  const typeName = getTypeName({
    schema,
    typeId: currentType,
    lastUsedTypeName: me.lastUsedTypeName,
  });

  useEffect(() => {
    inputNameRef.current?.focus();
  }, []);
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
          setError("");
          setSubmitting(true);
          e.preventDefault();
          if (currentType && currentWorkspace && currentName && schema) {
            createEntity(
              {
                host: currentWorkspace,
                typeId: currentType,
                entityName: currentName,
                schema,
                description: currentDescription,
              },
              {
                onSuccess({ linkToEntity }) {
                  onSave({
                    linkToEntity,
                    typeName,
                  });
                  setCurrentName("");
                  setCurrentDescription("");
                },
                onError(error: unknown) {
                  setSubmitting(false);
                  if (error instanceof Error) {
                    return setError(error.message);
                  }
                  setError("Oops, something has gone wrong.");
                },
              }
            );
          }
        }}
      >
        {error ? (
          <div className="block p-2 px-4 -mb-4 bg-yellow-50 text-yellow-600">
            {error}
          </div>
        ) : null}
        <label className="block px-4 pt-4" htmlFor="name">
          <span className="text-gray-500">Name</span>
          <input
            ref={inputNameRef}
            className="mt-1 block w-full border-gray-200 p-2 rounded text-sm focus:ring focus:ring-offset-0 focus:border-gray-400 focus:ring-gray-100 focus:ring-gray-100 focus:outline-none"
            value={currentName}
            onChange={(e) => setCurrentName(e.currentTarget.value)}
            type="text"
            name="name"
            id="name"
          />
        </label>
        <label className="block px-4" htmlFor="description">
          <span className="text-gray-500">Description</span>
          <textarea
            onKeyPress={(e) => {
              if (
                e.code.toLowerCase() === "enter" &&
                !e.shiftKey &&
                submitButtonRef.current
              ) {
                submitButtonRef.current.click();
              }
            }}
            className="mt-1 max-h-48 block w-full border-gray-200 rounded text-sm focus:ring focus:ring-offset-0 focus:border-gray-400 focus:ring-gray-100 focus:ring-gray-100 focus:outline-none"
            value={currentDescription}
            onChange={(e) => {
              setCurrentDescription(e.currentTarget.value);
            }}
            name="description"
            id="description"
            rows={3}
          />
        </label>
        <div className="block px-4 py-1">
          <button
            ref={submitButtonRef}
            title={
              disabled ? `Please select Workspace and ${typeTerm}` : undefined
            }
            className="disabled:opacity-50 disabled:cursor-default disabled:bg-gray-800 bg-gray-800 hover:bg-gray-800 rounded text-white text-sm font-medium leading-6 py-0.5 px-2 border border-transparent focus:ring-2 focus:ring-offset-1 focus:ring-offset-white focus:ring-gray-200 focus:outline-none"
            type="submit"
            disabled={disabled}
          >
            Create {typeName}{" "}
            <span className="rounded px-1 border text-xs font-normal ml-1 opacity-60 border-white border-opacity-30">
              Enter
            </span>
          </button>
        </div>

        <label
          className="flex gap-x-4 justify-between px-4 border-t border-gray-100 pt-2"
          htmlFor="workspace"
        >
          <span className="flex text-gray-500 flex-shrink-0 items-center">
            Workspace
          </span>
          <select
            className="min-w-0 w-56 text-sm mt-0 border-0 rounded focus:bg-gray-100 focus:ring-offset-0 focus:border-gray-100 focus:ring-gray-100 focus:ring-gray-100 focus:outline-none"
            onChange={(e) => setCurrentWorkspace(e.currentTarget.value)}
            value={currentWorkspace}
            name="workspace"
            id="workspace"
          >
            <option value="">Select Workspace</option>
            {me.workspaces.map(({ name }) => (
              <option key={name} value={name}>
                {getWorkspaceName(name)}
              </option>
            ))}
          </select>
        </label>
        <TypesSelect
          value={currentType}
          schema={schema}
          onChange={({ typeId }) => {
            setCurrentType(typeId);
          }}
        />
        <div className="border-t border-gray-100 text-gray-500 flex justify-between">
          <Shortcuts />
          <div className="px-4 py-2">{me.email}</div>
        </div>
      </form>
    </>
  );
}

function Login() {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <span className="block place-self-center text-center text-blue-700">
      <div className={styles.logo + " inline-block w-16 h-16"} />
      <div className="p-4">
        <a
          ref={ref}
          rel="noreferrer"
          href="https://fibery.io/login"
          target="_blank"
          className="disabled:opacity-50 disabled:cursor-default disabled:bg-gray-800 bg-gray-800 hover:bg-gray-800 rounded text-white text-sm font-medium leading-6 py-0.5 px-2 border border-transparent focus:ring-2 focus:ring-offset-1 focus:ring-offset-white focus:ring-gray-100 focus:outline-none"
          type="submit"
        >
          Please login to Fibery
        </a>
      </div>
    </span>
  );
}

function FinalStep({
  link,
  typeName,
  me,
  setLink,
}: {
  link: string;
  typeName?: string;
  me: User;
  setLink: (link: string) => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div className="place-self-center">
      <span className="block place-self-center text-center text-blue-700">
        <a
          ref={ref}
          rel="noreferrer"
          href={link}
          target="_blank"
          className="disabled:opacity-50 disabled:cursor-default disabled:bg-gray-800 bg-gray-800 hover:bg-gray-800 rounded text-white text-sm font-medium leading-6 py-0.5 px-2 border border-transparent focus:ring-2 focus:ring-offset-1 focus:ring-offset-white focus:ring-gray-100 focus:outline-none"
          type="submit"
        >
          Open{" "}
          {typeName || getTypeName({ lastUsedTypeName: me.lastUsedTypeName })}{" "}
          in Fibery
        </a>
      </span>

      <div className="flex justify-center">
        <div className="px-4 py-2 text-gray-500">
          <button onClick={() => setLink("")}>Go back</button>
        </div>
      </div>
    </div>
  );
}

function Content({ me, error }: { me?: User; error: AppError }) {
  const [link, setLink] = useState<string>();
  const [typeName, setTypeName] = useState<string>();
  if (link && me) {
    return (
      <FinalStep typeName={typeName} me={me} link={link} setLink={setLink} />
    );
  }
  //if (!me || true) {
  if (error && error.code === 401) {
    return <Login />;
  }
  if (error) {
    return (
      <div className="block p-2 place-self-center px-4 rounded bg-yellow-50 text-yellow-600">
        {error.message}
      </div>
    );
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
      onSave={({ linkToEntity, typeName }) => {
        setLink(linkToEntity);
        setTypeName(typeName);
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
      } mx-auto ${styles.app} grid relative`}
    >
      <Content me={me} error={error as AppError} />
    </div>
  );
}

export default App;
