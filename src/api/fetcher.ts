import {
  getMe,
  schemaPayload,
  getSchema,
  executeCommands,
  updateDocument,
} from "./api";
import { useQuery, useMutation } from "react-query";

export function useMe() {
  return useQuery(["me"], () => getMe());
}

export function useSchema(host?: string) {
  return useQuery(
    [...schemaPayload, host],
    () => (host ? getSchema(host) : Promise.resolve()),
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
    ({
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
      return executeCommands({
        host,
        commands: createEntityCommands({ typeId, entityName, schema }),
      }).then(([{ result }]: any) => {
        if (result && descriptionField) {
          return executeCommands({
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
                  params: { $id: result["fibery/id"] },
                },
              },
            ],
          }).then(([{ result }]: any) => {
            if (result) {
              const secret =
                result[0][descriptionField["fibery/name"]][
                  "Collaboration~Documents/secret"
                ];
              return updateDocument({ host, content: description, secret });
            }
            return {};
          });
        }
        return {};
      });
    }
  );
  return { mutate };
}
