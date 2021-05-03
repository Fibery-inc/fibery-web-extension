import { useState } from "react";
import styles from "./app.module.css";
import { useCreateEntity, useMe, useSchema } from "../api/fetcher";
import { User } from "../types";

function getTypes(schema: any) {
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
      !Boolean(type["fibery/meta"]["sync/source"])
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
  schema: any;
}) {
  return (
    <label className="flex gap-x-4 justify-between border-gray-100 px-4" htmlFor="type">
      <span className="flex flex-shrink-0 items-center text-gray-500">
        Type
      </span>
      {schema ? (
        <select
          className="min-w-0 w-60 text-sm mt-0 border-0 rounded focus:ring-0 focus:ring-offset-0 focus:outline-none"
          value={value}
          onChange={(e) =>
            onChange({
              typeId: e.currentTarget.value,
            })
          }
          name="type"
          id="type"
        >
          <option value="">Select Type</option>
          {getTypes(schema).map(({ groupLabel, types }) => {
            return (
              <optgroup key={groupLabel} label={groupLabel}>
                {types.map((type) => (
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
          className="disabled:opacity-50 min-w-0 w-60 text-sm mt-0 border-0 rounded focus:ring-0 focus:ring-offset-0 focus:outline-none"
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
  me: User;
  onSave: ({ linkToEntity }: { linkToEntity: string }) => void;
}) {
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
  const disabled = !Boolean(
    currentType && currentWorkspace && currentName && schema
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
          <span className="text-gray-500">Name</span>
          <input
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
            className="mt-1 block w-full border-gray-200 rounded text-sm focus:ring focus:ring-offset-0 focus:border-gray-400 focus:ring-gray-100 focus:ring-gray-100 focus:outline-none"
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
            className="disabled:opacity-50 disabled:cursor-default disabled:bg-gray-800 bg-gray-800 hover:bg-gray-800 rounded text-white text-sm font-medium leading-6 py-0.5 px-2 border border-transparent focus:ring-2 focus:ring-offset-1 focus:ring-offset-white focus:ring-gray-100 focus:outline-none"
            type="submit"
            disabled={disabled}
          >
            Create Entity
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
            className="min-w-0 w-60 text-sm mt-0 border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none"
            onChange={(e) => setCurrentWorkspace(e.currentTarget.value)}
            value={currentWorkspace}
            name="workspace"
            id="workspace"
          >
            <option value="">Select Workspace</option>
            {me.workspaces.map(({ name }: { name: any }) => (
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
        <div className="border-t border-gray-100 text-gray-500 flex justify-end">
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
