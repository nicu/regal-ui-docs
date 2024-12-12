import {
  assertIdentifier,
  assertTSTypeParameterInstantiation,
  TSTypeReference,
} from "@babel/types";
import { parseAnnotation } from "./annotation";
import { ASTPropertyValue } from "../../ast";

export function parseReference(annotation: TSTypeReference): ASTPropertyValue {
  assertIdentifier(annotation.typeName);
  switch (annotation.typeName.name) {
    case "Array":
      assertTSTypeParameterInstantiation(annotation.typeParameters);
      return {
        type: "array",
        value: annotation.typeParameters.params.map(parseAnnotation),
      };

    case "Record":
      assertTSTypeParameterInstantiation(annotation.typeParameters);
      const [keyParam, valueParam] =
        annotation.typeParameters.params.map(parseAnnotation);
      return {
        type: "record",
        value: [keyParam, valueParam],
      };

    case "Promise":
      assertTSTypeParameterInstantiation(annotation.typeParameters);
      return {
        type: "promise",
        value: annotation.typeParameters.params.map(parseAnnotation),
      };

    default:
      return {
        type: "reference",
        value: annotation.typeName.name,
      };
  }
}
