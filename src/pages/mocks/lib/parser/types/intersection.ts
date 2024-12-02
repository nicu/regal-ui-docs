import { TSIntersectionType, TSUnionType } from "@babel/types";
import { ASTIntersectionProperty } from "../../ast";
import { parseAnnotation } from "./annotation";

export function parseIntersection(
  intersection: TSIntersectionType
): ASTIntersectionProperty {
  return {
    type: "intersection",
    value: intersection.types.map(parseAnnotation),
  };
}
