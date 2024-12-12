import { Expression } from "@babel/types";
import { ASTPropertyValue } from "../../ast";

export function parseExpression(expression: Expression): ASTPropertyValue {
  switch (expression.type) {
    case "StringLiteral":
    case "NumericLiteral":
      return { type: "constant", value: expression.value };

    case "ArrayExpression":
      return { type: "array", value: expression.elements.map(parseExpression) };

    default:
      throw new Error(`Unexpected expression type: ${expression.type}`);
  }
}
