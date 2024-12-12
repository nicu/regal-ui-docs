import {
  ASTArrayProperty,
  ASTConstantProperty,
  ASTEntity,
  ASTEntityAlias,
  ASTEntityInstance,
  ASTIntersectionProperty,
  ASTObjectProperty,
  ASTPrimitiveProperty,
  ASTProperty,
  ASTPropertyValue,
  ASTRecordProperty,
  ASTReferenceProperty,
  ASTUnionProperty,
} from "../ast";
import { snakeCase, camelCase } from "lodash";

type Differences = Record<string, Array<{ path: string; note: string }>>;

export const matchEntities = (
  data: Array<any>,
  entities: Array<ASTEntity>,
  threshold: number = 1
) => {
  const findEntity = (target: string) =>
    entities.find(({ name }) => name === target);

  const getInheritedFields = (parents: Array<string>) => {
    let fields: Array<ASTProperty> = [];
    parents.forEach((parentName) => {
      const parent = findEntity(parentName);
      if (parent) {
        switch (parent.type) {
          case "instance":
            fields = fields.concat(parent.properties);
            if (parent.inherits) {
              fields = fields.concat(getInheritedFields(parent.inherits));
            }
            break;

          case "placeholder":
            // no inherited fields
            break;

          default:
            throw new Error(`TODO inherited fields for "${parent.type}"`);
        }
      }
    });

    return fields;
  };

  const matchPrimitive = (
    data: any,
    property: ASTPrimitiveProperty,
    name: string,
    path: string,
    differences: Differences
  ) => {
    const dataType = typeof data;

    let result: boolean;
    switch (property.value) {
      case "string":
        result = dataType === "string";
        break;
      case "number":
        result = dataType === "number";
        break;
      case "boolean":
        result = dataType === "boolean";
        break;
      case "null":
        result = dataType === null;
        break;
      case "any":
        result = true;
        break;
      case "unknown":
        result = true;
        break;
      default:
        result = false;
    }

    if (!result) {
      differences[name].push({
        path: path,
        note: `Expected "${property.value}", got "${dataType}"`,
      });
    }

    return result ? 1 : 0;
  };

  const matchConstant = (
    data: any,
    property: ASTConstantProperty,
    name: string,
    path: string,
    differences: Differences
  ) => {
    if (data !== property.value) {
      differences[name].push({
        path: path,
        note: `Expected constant value "${
          property.value
        }", got "${typeof data}"`,
      });
      return 0;
    }
    return 1;
  };

  const matchIntersection = (
    data: any,
    property: ASTIntersectionProperty,
    name: string,
    path: string,
    differences: Differences
  ) => {
    const result = property.value.every((item) => {
      const score = matchValue(data, item, name, path, differences);
      return score > threshold;
    });

    if (!result) {
      differences[name].push({
        path: path,
        note: `Unexpected value for "${property.type}"`,
      });
    }

    return result ? 1 : 0;
  };

  const matchUnion = (
    data: any,
    properties: Array<ASTPropertyValue>,
    name: string,
    path: string,
    differences: Differences
  ) => {
    const result = properties
      .map((item) => {
        const score = matchValue(data, item, name, path, differences);
        return { score, name: item };
      })
      .sort((a, b) => b.score - a.score);

    const [topMatch] = result;
    if (!topMatch || topMatch.score === 0) {
      differences[name].push({
        path: path,
        note: `Union does not match value`,
      });

      return 0;
    }

    return topMatch.score;
  };

  const matchArray = (
    data: any,
    property: ASTArrayProperty,
    name: string,
    path: string,
    differences: Differences
  ): number => {
    if (!Array.isArray(data)) {
      differences[name].push({
        path,
        note: `Expected "array", got "${typeof data}"`,
      });
      return 0;
    }

    const [arrayType] = property.value;
    return data.every((item, index) =>
      matchValue(
        item,
        arrayType,
        name,
        [path, `[${index}]`].join("."),
        differences
      )
    )
      ? 1
      : 0;
  };

  const matchObject = (
    data: any,
    objectProperties: Array<ASTProperty>,
    name: string,
    path: string,
    differences: Differences
  ) => {
    const dataType = typeof data;
    if (dataType !== "object") {
      differences[name].push({
        path,
        note: `Expected "object", got "${dataType}"`,
      });

      return 0;
    }

    if (Array.isArray(data)) {
      differences[name].push({ path, note: `Expected "object", got "array"` });
      return 0;
    }

    if (data === null) {
      differences[name].push({ path, note: `Expected "object", got "null"` });
      return 0;
    }

    const dataKeys = Object.keys(data).map(camelCase);
    const objectKeys = objectProperties.map((prop) => prop.name);

    const allKeys = new Set([...dataKeys, ...objectKeys]);
    let totalWeight = allKeys.size;
    let matchCount = 0;

    for (const key of dataKeys) {
      if (!objectKeys.find((objKey) => objKey === key)) {
        differences[name].push({
          path: path,
          note: `Missing "${key}"`,
        });
      }
    }

    for (const property of objectProperties) {
      const currentPath = [path, property.name].filter(Boolean).join(".");
      const value = data?.[property.name] ?? data?.[snakeCase(property.name)];

      if (value === undefined && property.optional) {
        matchCount++;
      } else {
        let isMatch;
        switch (property.type) {
          case "primitive":
            isMatch = matchPrimitive(
              value,
              property,
              name,
              currentPath,
              differences
            );
            break;

          case "array":
            isMatch = matchArray(
              value,
              property,
              name,
              currentPath,
              differences
            );
            break;

          case "intersection":
            isMatch = matchIntersection(
              value,
              property,
              name,
              currentPath,
              differences
            );
            break;

          case "object":
            isMatch = matchObject(
              value,
              property.value,
              name,
              currentPath,
              differences
            );
            break;

          case "reference":
            isMatch = matchReference(
              value,
              property,
              name,
              currentPath,
              differences
            );
            break;

          case "union":
            isMatch = matchUnion(
              value,
              property.value,
              name,
              currentPath,
              differences
            );
            break;

          case "constant":
            isMatch = matchConstant(
              value,
              property,
              name,
              currentPath,
              differences
            );
            break;

          case "record":
            isMatch = matchRecord(value, name, currentPath, differences);
            break;

          default:
            throw new Error(`Unexpected property: "${property.type}"`);
        }

        if (isMatch > threshold) {
          matchCount++;
        }
        // else {
        //   differences[name].push({
        //     path: currentPath,
        //     note: `Unexpected property type: "${property.type}"`,
        //   });
        // }
      }
    }

    const result = Math.round((matchCount / totalWeight) * 100) / 100;
    if (result < threshold) {
      differences[name].push({
        path,
        note: `Object doesn't match expected structure (${result} / ${threshold})`,
      });
    }

    return result;
  };

  const matchRecord = (
    data: any,
    name: string,
    path: string,
    differences: Differences
  ) => {
    const dataType = typeof data;
    if (dataType !== "object" || Array.isArray(data)) {
      differences[name].push({
        path,
        note: `Expected "object", got "${dataType}"`,
      });
      return 0;
    }

    return 1;
  };

  const matchReference = (
    data: any,
    value: ASTReferenceProperty,
    name: string,
    path: string,
    differences: Differences
  ) => {
    const entity = findEntity(value.value);
    if (!entity) {
      differences[name].push({
        path,
        note: `Cannot find referenced type: "${value.value}"`,
      });
      return 0;
    }

    return matchEntity(data, entity, name, path, differences);
  };

  const matchValue = (
    data: any,
    value: ASTPropertyValue,
    name: string,
    path: string,
    differences: Differences
  ): number => {
    switch (value.type) {
      case "reference":
        return matchReference(data, value, name, path, differences);

      case "object":
        return matchObject(data, value.value, name, path, differences);

      case "record":
        return matchRecord(data, name, path, differences);

      case "primitive":
        return matchPrimitive(data, value, name, path, differences);

      case "array":
        return matchArray(data, value, name, path, differences);

      case "intersection":
        return matchIntersection(data, value, name, path, differences);

      case "constant":
        return matchConstant(data, value, name, path, differences);

      case "union":
        return matchUnion(data, value.value, name, path, differences);

      default:
        throw new Error(`Unhandled ${value.type}`);
    }
  };

  const matchAlias = (
    data: any,
    alias: ASTEntityAlias,
    name: string,
    path: string,
    differences: Differences
  ) => {
    const result = alias.entities
      .map((item) => {
        const entity = findEntity(item);
        if (!entity) {
          differences[name].push({
            path,
            note: `Cannot find referenced type: "${item}"`,
          });
          return { score: 0, name: item };
        }

        const score = matchEntity(data, entity, name, path, differences);
        return { score, name: item };
      })
      .sort((a, b) => b.score - a.score);

    const [topMatch] = result;
    if (!topMatch || topMatch.score === 0) {
      differences[name].push({
        path: path,
        note: `Unexpected alias`,
      });

      return 0;
    }

    return topMatch.score;
  };

  const matchInstance = (
    data: any,
    entity: ASTEntityInstance,
    name: string,
    path: string,
    differences: Differences
  ) => {
    const inheritedFields = getInheritedFields(entity.inherits ?? []);
    const ownFields = entity.properties;
    return matchObject(
      data,
      [...inheritedFields, ...ownFields],
      name,
      path,
      differences
    );
  };

  const matchEntity = (
    data: any,
    entity: ASTEntity,
    name: string,
    path: string,
    differences: Differences
  ): number => {
    differences[name] ||= [];

    switch (entity.type) {
      case "instance":
        return matchInstance(data, entity, name, path, differences);
      case "alias":
        return matchAlias(data, entity, name, path, differences);
      case "union":
        return matchUnion(data, entity.values, name, path, differences);
      case "placeholder":
        return 0;
    }
  };

  return data.map((item) => {
    const group: Record<string, any> = {
      data: item,
    };

    const differences: Differences = {};
    group.entities = entities
      .map((entity) => ({
        score: matchEntity(item, entity, entity.name, "", differences),
        entity,
      }))
      .filter(({ score }) => score > threshold)
      .sort((a, b) => b.score - a.score)
      .map(({ entity, score }) => {
        return { name: entity.name, score };
      });
    // .map(({ entity, score }) => `${entity.name} (${score})`)
    // .join(", ");

    group.differences = differences;

    return group;
  });
};
