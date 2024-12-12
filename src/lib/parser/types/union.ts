import { TSUnionType } from "@babel/types";
import { ASTUnionProperty } from "../../ast";
import { parseAnnotation } from "./annotation";

export function parseUnion(union: TSUnionType): ASTUnionProperty {
  return {
    type: "union",
    value: union.types.map(parseAnnotation),
  };
}
