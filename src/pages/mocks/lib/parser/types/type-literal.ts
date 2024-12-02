import {
  assertIdentifier,
  assertTSPropertySignature,
  assertTSTypeAnnotation,
  isTSIndexSignature,
  TSTypeLiteral,
} from "@babel/types";
import { parseAnnotation } from "./annotation";
import { ASTProperty } from "../../ast";

export function parseTypeLiteral(
  annotation: TSTypeLiteral
): Array<ASTProperty> {
  return annotation.members
    .filter((member) => !isTSIndexSignature(member))
    .map((member) => {
      assertTSPropertySignature(member);
      assertIdentifier(member.key);
      assertTSTypeAnnotation(member.typeAnnotation);

      const name = member.key.name;
      const optional = member.optional ?? false;
      const { type, value } = parseAnnotation(
        member.typeAnnotation.typeAnnotation
      );

      return {
        name,
        type,
        value,
        optional,
      } as ASTProperty;
    });
}
