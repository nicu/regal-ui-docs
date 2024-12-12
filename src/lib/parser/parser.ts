import "./env";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

import {
  assertIdentifier,
  assertTSExpressionWithTypeArguments,
  assertTSPropertySignature,
  assertTSTypeAnnotation,
} from "@babel/types";
import {
  ASTArrayProperty,
  ASTEntity,
  ASTEntityInstance,
  ASTPrimitiveProperty,
  ASTProperty,
} from "../ast";
import { parseTypeLiteral } from "./types/type-literal";
import { parseTypeIntersection } from "./types/type-intersection";
import { parseTypeUnion } from "./types/type-union";
import { parseAnnotation } from "./types/annotation";
import { parseLiteral } from "./types/literal";
import { parseTypeIndexed } from "./types/type-indexed";
import { parseTypeQuery } from "./types/type-query";
import { findDeclaration } from "./utils";

export function parseContents(contents: string) {
  const ast = parse(contents, {
    sourceType: "module",
    ranges: false,
    plugins: ["jsx", "typescript"],
  });

  const entities: Array<ASTEntity> = [];

  traverse(ast, {
    TSTypeAliasDeclaration(path) {
      const { node } = path;
      assertIdentifier(node.id);

      const isExported = path.parent.type === "ExportNamedDeclaration";

      try {
        switch (node.typeAnnotation.type) {
          case "TSTypeLiteral":
            {
              const properties = parseTypeLiteral(node.typeAnnotation);
              entities.push({
                name: node.id.name,
                type: "instance",
                properties,
                isExported,
              });
            }
            break;

          case "TSIntersectionType":
            {
              const { properties, inherits } = parseTypeIntersection(
                node.typeAnnotation
              );
              entities.push({
                name: node.id.name,
                type: "instance",
                properties,
                inherits,
                isExported,
              } as ASTEntityInstance);
            }
            break;

          case "TSUnionType":
            {
              const entity = parseTypeUnion(node.typeAnnotation);
              entities.push({
                name: node.id.name,
                isExported,
                ...entity,
              });
            }
            break;

          case "TSLiteralType": {
            const value = parseLiteral(node.typeAnnotation);
            entities.push({
              name: node.id.name,
              type: "constant",
              value,
              isExported,
            });
            break;
          }

          case "TSArrayType":
            {
              const value = parseAnnotation(
                node.typeAnnotation
              ) as ASTArrayProperty;
              entities.push({
                name: node.id.name,
                type: "array",
                value,
                isExported,
              });
            }
            break;

          // case "TSTypeQuery":
          //   {
          //     const referenceType = parseTypeQuery(node.typeAnnotation);
          //     const value = findDeclaration(referenceType.value as string, ast);

          //     entities.push({
          //       name: node.id.name,
          //       type: value.type,
          //       value,
          //     });
          //   }
          //   break;

          // case "TSIndexedAccessType":
          //   {
          //     // const value = parseTypeIndexed(
          //     //   node.typeAnnotation,
          //     //   entities
          //     // ) as ASTPrimitiveProperty;

          //     // entities.push({
          //     //   name: node.id.name,
          //     //   type: value.type,
          //     //   value,
          //     // });

          //     console.log(
          //       ">>> INDEXED",
          //       parseTypeIndexed(node.typeAnnotation, entities, ast)
          //     );
          //   }
          //   break;

          default:
            console.log(`Couldn't parse ${node.typeAnnotation.type}`);
            entities.push({
              name: node.id.name,
              type: "placeholder",
              isExported,
            });
        }
      } catch (e) {
        console.log(e);
        // we couldn't fully parse this entity
        // but we stil want to be able to reference it from other entities
        entities.push({
          name: node.id.name,
          type: "placeholder",
          isExported,
        });
      }
    },

    TSInterfaceDeclaration(path) {
      const { node } = path;
      assertIdentifier(node.id);
      const isExported = path.parent.type === "ExportNamedDeclaration";

      try {
        const properties: Array<ASTProperty> = node.body.body.map((prop) => {
          assertTSPropertySignature(prop);
          assertIdentifier(prop.key);
          assertTSTypeAnnotation(prop.typeAnnotation);

          return {
            name: prop.key.name,
            optional: prop.optional ?? false,
            ...parseAnnotation(prop.typeAnnotation.typeAnnotation),
          };
        });

        const inherits =
          node.extends?.map((item) => {
            assertTSExpressionWithTypeArguments(item);
            assertIdentifier(item.expression);
            return item.expression.name;
          }) ?? [];

        entities.push({
          name: node.id.name,
          type: "instance",
          properties,
          inherits,
          isExported,
        });
      } catch (e) {
        console.log(e);
        // we couldn't fully parse this entity
        // but we stil want to be able to reference it from other entities
        entities.push({
          name: node.id.name,
          type: "placeholder",
          isExported,
        });
      }
    },
  });

  return entities;
}
