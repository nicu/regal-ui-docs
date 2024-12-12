import { TSIntersectionType } from "@babel/types";
import { ASTEntity, ASTEntityInstance, ASTReferenceProperty } from "../../ast";
import { parseReference } from "./reference";
import { parseTypeLiteral } from "./type-literal";

export function parseTypeIntersection(
  annotation: TSIntersectionType
): Pick<ASTEntityInstance, "inherits" | "properties"> {
  const inherits: ASTEntityInstance["inherits"] = [];
  let properties: ASTEntityInstance["properties"] = [];

  annotation.types.map((type) => {
    switch (type.type) {
      case "TSTypeReference":
        const { value } = parseReference(type) as ASTReferenceProperty;
        inherits.push(value);
        break;

      case "TSTypeLiteral":
        properties = properties.concat(parseTypeLiteral(type));
        break;
    }
  });

  return {
    inherits,
    properties,
  };
}
