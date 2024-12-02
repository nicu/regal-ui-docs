import { File, TSIndexedAccessType } from "@babel/types";
import { ASTProperty, ASTEntity, ASTPropertyValue } from "../../ast";
import { parseReference } from "./reference";
import { parseLiteral } from "./literal";
import { parseAnnotation } from "./annotation";
import { findDeclaration, findEntity } from "../utils";
import { ParseResult } from "@babel/parser";

export function parseTypeIndexed(
  annotation: TSIndexedAccessType,
  entities: Array<ASTEntity>,
  ast: ParseResult<File>
) {
  const objectType = annotation.objectType;
  const indexType = annotation.indexType;

  const typeRef = parseAnnotation(objectType);
  const indexRef = parseAnnotation(indexType);

  let entity: ASTEntity;

  switch (typeRef.type) {
    case "reference":
      entity = findEntity(typeRef.value, entities);
      if (!entity) {
        entity = findDeclaration(typeRef.value, ast);
      }
      break;

    default:
      throw new Error(
        `Unexpected type reference in indexed type: "${typeRef.type}"`
      );
  }

  console.log(entity);

  // switch (entity.type) {
  //   case "instance":
  //     return entity.properties.find((prop) => prop.name === indexRef.value);

  //   default:
  //     throw new Error(
  //       `Unexpected entity type in indexed type: "${typeRef.type}"`
  //     );
  // }
}
