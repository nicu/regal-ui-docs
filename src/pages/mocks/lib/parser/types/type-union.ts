import {
  assertIdentifier,
  assertTSTypeReference,
  isTSLiteralType,
  TSUnionType,
} from "@babel/types";
import { parseUnion } from "./union";
import { ASTEntityAlias, ASTEntityUnion } from "../../ast";

export function parseTypeUnion(
  annotation: TSUnionType
): Omit<ASTEntityUnion, "name"> | Omit<ASTEntityAlias, "name"> {
  const isLiteralUnion = annotation.types.every((type) =>
    isTSLiteralType(type)
  );

  if (isLiteralUnion) {
    const { type, value } = parseUnion(annotation);
    return { type, values: value };
  }

  return {
    type: "alias",
    entities: annotation.types.map((type) => {
      assertTSTypeReference(type);
      assertIdentifier(type.typeName);
      return type.typeName.name;
    }),
  };
}
