import { useQuery, useMutation } from "react-query";
import { getMe, executeCommands, updateDocument, getSchema } from "./api";
import { setValue } from "./storage.api";
import { getLink } from "./get-link";
import { getTypeName } from "./get-type-name";
import { User, Schema, Entity } from "../types";
import { getDescriptionField } from "./get-description-field";

export function useMe() {
  return useQuery<User>(["me"], () => getMe());
}

export function useSchema(host?: string) {
  return useQuery(
    ["schema", host],
    () => (host ? getSchema(host) : Promise.resolve(undefined)),
    {
      enabled: Boolean(host),
    }
  );
}

export function useGetAvailableApps(host?: string) {
  return useQuery(
    ["availableApps", host],
    () =>
      host
        ? executeCommands<Record<string, string[]>>({
            host,
            commands: [
              {
                command: "fibery.type/query-user-capabilities",
                args: {
                  capabilities: ["entity.create"],
                },
              },
            ],
            returnFirstResult: false,
          }).then((data) => {
            const apps: Record<string, string[]> = {};
            Object.entries(data).forEach(([typeName]) => {
              const appName = typeName.split("/")[0];
              if (!apps[appName]) {
                apps[appName] = [];
              }
              apps[appName].push(typeName);
            });
            return apps;
          })
        : Promise.resolve(undefined),
    {
      enabled: Boolean(host),
    }
  );
}

const createEntityCommands = ({
  typeId,
  schema,
  entityName,
  url,
}: {
  typeId: string;
  entityName: string;
  url: string;
  schema: Schema;
}) => {
  const type = schema["fibery/types"].find((type) => {
    return type["fibery/id"] === typeId;
  });
  if (!type) {
    throw Error("Could not find type in fibery schema");
  }
  const titleField = type["fibery/fields"].find((field) => {
    return field["fibery/meta"]["ui/title?"] === true;
  });
  if (!titleField) {
    throw Error(`Type ${type["fibery/name"]} doesn't have title field`);
  }
  const urlField = type["fibery/fields"].find((field) => {
    return (
      field["fibery/meta"]["ui/type"] === "url" ||
      field["fibery/type"] === "fibery/url"
    );
  });
  return [
    {
      command: "fibery.entity/create",
      args: {
        type: type["fibery/name"],
        entity: {
          [titleField["fibery/name"]]: entityName,
          ...(urlField && { [urlField["fibery/name"]]: url }),
        },
      },
    },
  ];
};

export function useCreateEntity() {
  const { mutate } = useMutation(
    async ({
      host,
      entityName,
      description,
      typeId,
      schema,
      url,
    }: {
      host: string;
      entityName: string;
      description: string;
      typeId: string;
      url: string;
      schema: Schema;
    }) => {
      const type = schema["fibery/types"].find((type) => {
        return type["fibery/id"] === typeId;
      });
      if (!type) {
        throw Error("Could not find type in fibery schema");
      }
      const descriptionField = getDescriptionField({ schema, typeId });
      await setValue("lastUsedType", typeId);
      await setValue("lastUsedWorkspace", host);
      await setValue("lastUsedTypeName", getTypeName({ schema, typeId }));
      const entity = await executeCommands<Entity>({
        host,
        commands: createEntityCommands({ typeId, entityName, schema, url }),
      });

      if (
        descriptionField &&
        descriptionField["fibery/type"] === "Collaboration~Documents/Document"
      ) {
        const entityWithDocumentSecret = await executeCommands<Entity>({
          host,
          commands: [
            {
              command: "fibery.entity/query",
              args: {
                query: {
                  "q/from": type["fibery/name"],
                  "q/select": [
                    "fibery/id",
                    {
                      [descriptionField["fibery/name"]]: [
                        "Collaboration~Documents/secret",
                      ],
                    },
                  ],
                  "q/where": ["=", ["fibery/id"], "$id"],
                  "q/limit": 1,
                },
                params: { $id: entity["fibery/id"] },
              },
            },
          ],
        });
        const secret =
          entityWithDocumentSecret[descriptionField["fibery/name"]] &&
          (
            entityWithDocumentSecret[descriptionField["fibery/name"]] as Record<
              string,
              string
            >
          )["Collaboration~Documents/secret"];
        if (typeof secret === "string") {
          await updateDocument({ host, content: description, secret });
        }
      }
      return { entity, linkToEntity: getLink({ host, entity, type }) };
    }
  );
  return { mutate };
}
