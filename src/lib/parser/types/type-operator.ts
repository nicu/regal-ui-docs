import { TSTypeOperator } from "@babel/types";
import { parseAnnotation } from "./annotation";
import { ASTPropertyValue, ASTTypeOperatorProperty } from "../../ast";

export function parseTypeOperator(
  annotation: TSTypeOperator
): ASTPropertyValue {
  const typeRef = parseAnnotation(annotation.typeAnnotation);

  switch (typeRef.type) {
    case "reference":
      return {
        type: "typeOperator",
        operator: annotation.operator as ASTTypeOperatorProperty["operator"],
        value: typeRef,
      };
    default:
      throw new Error(`Unexpected type operator: ${typeRef.type}`);
  }
}
