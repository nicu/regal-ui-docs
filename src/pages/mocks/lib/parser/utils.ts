import { ParseResult } from "@babel/parser";
import { ASTEntity } from "../ast";
import { File } from "@babel/types";
import traverse from "@babel/traverse";
import { parseExpression } from "./values/expression";
import { parseAnnotation } from "./types/annotation";

export const findEntity = (target: string, entities: Array<ASTEntity>) =>
  entities.find(({ name }) => name === target);

export const findDeclaration = (target: string, ast: ParseResult<File>) => {
  let declaration;
  traverse(ast, {
    Identifier(path) {
      if (
        !declaration &&
        path.node.name === target &&
        !Array.isArray(path.container) &&
        path.container.type === "VariableDeclarator"
      ) {
        declaration = parseExpression(path.container.init);
      }
    },
  });

  return declaration;
};
