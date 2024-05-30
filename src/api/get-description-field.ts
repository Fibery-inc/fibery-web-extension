import { FiberyField, Schema } from "../types";

const nonExistField = {
  "fibery/name": "Description",
  "fibery/type": "non-exist",
  "fibery/meta": {},
};
export function getDescriptionField({
  schema,
  typeId,
}: {
  schema: Schema | undefined;
  typeId: string | undefined;
}): FiberyField {
  if (!schema || !typeId) {
    return nonExistField;
  }
  const type = schema["fibery/types"].find((type) => {
    return type["fibery/id"] === typeId;
  });

  if (!type) {
    return nonExistField;
  }

  let descriptionField = type["fibery/fields"].find((field) => {
    if (
      field["fibery/type"] === "Collaboration~Documents/Document" &&
      field["fibery/name"].toLowerCase().trim().endsWith("description")
    ) {
      return field;
    }
  });
  if (!descriptionField) {
    descriptionField = type["fibery/fields"].find((field) => {
      if (field["fibery/type"] === "Collaboration~Documents/Document") {
        return field;
      }
    });
    if (!descriptionField) {
      return nonExistField;
    }
  }
  return descriptionField;
}

export function getDescriptionFieldName(field: FiberyField): string {
  return field["fibery/name"].split("/").pop() || "";
}
