import { TSLiteralType } from "@babel/types";
import { ASTConstantProperty } from "../../ast";

export function parseLiteral(literalType: TSLiteralType): ASTConstantProperty {
  switch (literalType.literal.type) {
    case "StringLiteral":
    case "NumericLiteral":
    case "BooleanLiteral":
      return {
        type: "constant",
        value: literalType.literal.value,
      };

    default:
      throw new Error(`Unexpected literal: ${literalType.literal.type}`);
  }
}
