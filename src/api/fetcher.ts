import { useQuery, useMutation } from "react-query";
import {
  getMe,
  schemaPayload,
  getSchema,
  executeCommands,
  updateDocument,
} from "./api";
import { setValue } from "./storage.api";
import { getLink } from "./getLink";
import { User } from "../types";

export function useMe() {
  return useQuery<User>(["me"], () => getMe());
}

export function useSchema(host?: string) {
  return useQuery(
    [...schemaPayload, host],
    () =>
      host
        ? getSchema(host).then((res: any) => {
            return res[0].result;
          })
        : Promise.resolve(),
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
  schema: any;
}) => {
  const type = schema["fibery/types"].find((type: any) => {
    return type["fibery/id"] === typeId;
  });
  const titleField = type["fibery/fields"].find((field: any) => {
    return field["fibery/meta"]["ui/title?"] === true;
  });
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
      schema: any;
    }) => {
      const type = schema["fibery/types"].find((type: any) => {
        return type["fibery/id"] === typeId;
      });
      const descriptionField = type["fibery/fields"].find((field: any) => {
        return field["fibery/name"]
          .toLowerCase()
          .trim()
          .endsWith("description");
      });
      await setValue("lastUsedType", typeId);
      await setValue("lastUsedWorkspace", host);
      const [{ result: entity }] = (await executeCommands({
        host,
        commands: createEntityCommands({ typeId, entityName, schema }),
      })) as any;
      if (!entity) {
        throw new Error("Could not create entity");
      }
      if (descriptionField) {
        const [{ result: secrets }] = (await executeCommands({
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
        })) as any;
        if (!secrets) {
          throw new Error("Could not save description");
        }
        const secret =
          secrets[0][descriptionField["fibery/name"]][
            "Collaboration~Documents/secret"
          ];
        await updateDocument({ host, content: description, secret });
      }
      return { entity, linkToEntity: getLink({ host, entity, type }) };
    }
  );
  return { mutate };
}
