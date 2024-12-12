export type ASTPrimitiveProperty = {
  type: "primitive";
  value: "string" | "number" | "boolean" | "null" | "any" | "unknown";
};

export type ASTConstantProperty = {
  type: "constant";
  value: string | number | boolean;
};

export type ASTUnionProperty = {
  type: "union";
  value: Array<ASTPropertyValue>;
};

export type ASTIntersectionProperty = {
  type: "intersection";
  value: Array<ASTPropertyValue>;
};

export type ASTArrayProperty = {
  type: "array";
  value: Array<ASTPropertyValue>;
};

export type ASTObjectProperty = {
  type: "object";
  value: Array<ASTProperty>;
};

export type ASTRecordProperty = {
  type: "record";
  value: Array<ASTPropertyValue>;
};

export type ASTFunctionProperty = {
  type: "function";
  value: ASTPropertyValue;
};

export type ASTPromiseProperty = {
  type: "promise";
  value: Array<ASTPropertyValue>;
};

export type ASTReferenceProperty = {
  type: "reference";
  value: string;
};

export type ASTTypeOperatorProperty = {
  type: "typeOperator";
  operator: "keyof" | "unique" | "readonly";
  value: ASTPropertyValue;
};

export type ASTPropertyValue =
  | ASTPrimitiveProperty
  | ASTConstantProperty
  | ASTUnionProperty
  | ASTIntersectionProperty
  | ASTArrayProperty
  | ASTObjectProperty
  | ASTRecordProperty
  | ASTFunctionProperty
  | ASTPromiseProperty
  | ASTReferenceProperty
  | ASTTypeOperatorProperty;

export type ASTProperty = ASTPropertyValue & {
  name: string;
  optional: boolean;
};

export type ASTEntityInstance = {
  name: string;
  type: "instance";
  properties: Array<ASTProperty>;
  inherits?: Array<string>;
  isExported: boolean;
};

export type ASTEntityUnion = {
  name: string;
  type: "union";
  values: Array<ASTPropertyValue>;
  isExported: boolean;
};

export type ASTEntityAlias = {
  name: string;
  type: "alias";
  entities: Array<string>;
  isExported: boolean;
};

export type ASTEntityArray = {
  name: string;
  type: "array";
  value: ASTArrayProperty;
  isExported: boolean;
};

export type ASTEntityPrimitive = {
  name: string;
  type: "primitive";
  value: ASTPrimitiveProperty;
  isExported: boolean;
};

export type ASTEntityConstant = {
  name: string;
  type: "constant";
  value: ASTPropertyValue;
  isExported: boolean;
};

export type ASTEntityPlaceholder = {
  name: string;
  type: "placeholder";
  isExported: boolean;
};

export type ASTEntity =
  | ASTEntityInstance
  | ASTEntityUnion
  | ASTEntityAlias
  | ASTEntityArray
  | ASTEntityPrimitive
  | ASTEntityConstant
  | ASTEntityPlaceholder;
