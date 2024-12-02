import { assertTSTypeAnnotation, TSType } from "@babel/types";
import { ASTPropertyValue } from "../../ast";
import { parseLiteral } from "./literal";
import { parseUnion } from "./union";
import { parseReference } from "./reference";
import { parseTypeLiteral } from "./type-literal";
import { parseIntersection } from "./intersection";
import { parseTypeQuery } from "./type-query";
import { parseTypeOperator } from "./type-operator";

export function parseAnnotation(annotation: TSType): ASTPropertyValue {
  switch (annotation.type) {
    case "TSStringKeyword":
      return {
        type: "primitive",
        value: "string",
      };

    case "TSNumberKeyword":
      return {
        type: "primitive",
        value: "number",
      };

    case "TSBooleanKeyword":
      return {
        type: "primitive",
        value: "boolean",
      };

    case "TSNullKeyword":
      return {
        type: "primitive",
        value: "null",
      };

    case "TSAnyKeyword":
      return {
        type: "primitive",
        value: "any",
      };

    case "TSUnknownKeyword":
      return {
        type: "primitive",
        value: "unknown",
      };

    case "TSLiteralType":
      return parseLiteral(annotation);

    case "TSUnionType":
      return parseUnion(annotation);

    case "TSIntersectionType":
      return parseIntersection(annotation);

    case "TSTypeReference":
      return parseReference(annotation);

    case "TSArrayType":
      return {
        type: "array",
        value: [parseAnnotation(annotation.elementType)],
      };

    case "TSTypeLiteral":
      return {
        type: "object",
        value: parseTypeLiteral(annotation),
      };

    case "TSFunctionType":
      assertTSTypeAnnotation(annotation.typeAnnotation);
      return {
        type: "function",
        value: parseAnnotation(annotation.typeAnnotation.typeAnnotation),
      };

    case "TSParenthesizedType":
      return parseAnnotation(annotation.typeAnnotation);

    // case "TSTypeQuery":
    //   return parseTypeQuery(annotation);

    // case "TSTypeOperator":
    //   return parseTypeOperator(annotation);

    default:
      console.log(annotation);
      throw new Error(`Unexpected type: ${annotation.type}`);
  }
}
