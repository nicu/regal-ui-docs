import { TSTypeQuery } from "@babel/types";
import { ASTPropertyValue } from "../../ast";

export function parseTypeQuery(annotation: TSTypeQuery): ASTPropertyValue {
  switch (annotation.exprName.type) {
    case "Identifier":
      return { type: "reference", value: annotation.exprName.name };
    default:
      throw new Error(
        `Unexpected type query expression: ${annotation.exprName.type}`
      );
  }
}
