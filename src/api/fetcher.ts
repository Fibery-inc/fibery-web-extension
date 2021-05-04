import { useQuery, useMutation } from "react-query";
import { getMe, executeCommands, updateDocument } from "./api";
import { setValue } from "./storage.api";
import { getLink } from "./getLink";
import { User, Schema, Entity } from "../types";

export function useMe() {
  return useQuery<User>(["me"], () => getMe());
}

const schemaPayload = [{ command: "fibery.schema/query", args: {} }];
export function useSchema(host?: string) {
  return useQuery(
    [...schemaPayload, host],
    () =>
      host
        ? executeCommands<Schema>({ host, commands: schemaPayload })
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
}: {
  typeId: string;
  entityName: string;
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
  return [
    {
      command: "fibery.entity/create",
      args: {
        type: type["fibery/name"],
        entity: {
          [titleField["fibery/name"]]: entityName,
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
    }: {
      host: string;
      entityName: string;
      description: string;
      typeId: string;
      schema: Schema;
    }) => {
      const type = schema["fibery/types"].find((type) => {
        return type["fibery/id"] === typeId;
      });
      if (!type) {
        throw Error("Could not find type in fibery schema");
      }
      const descriptionField = type["fibery/fields"].find((field) => {
        return field["fibery/name"]
          .toLowerCase()
          .trim()
          .endsWith("description");
      });
      await setValue("lastUsedType", typeId);
      await setValue("lastUsedWorkspace", host);
      const entity = await executeCommands<Entity>({
        host,
        commands: createEntityCommands({ typeId, entityName, schema }),
      });

      if (descriptionField) {
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
          (entityWithDocumentSecret[descriptionField["fibery/name"]] as Record<
            string,
            string
          >)["Collaboration~Documents/secret"];
        if (typeof secret === "string") {
          await updateDocument({ host, content: description, secret });
        }
      }
      return { entity, linkToEntity: getLink({ host, entity, type }) };
    }
  );
  return { mutate };
}
