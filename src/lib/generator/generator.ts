import {
  ASTArrayProperty,
  ASTConstantProperty,
  ASTEntity,
  ASTFunctionProperty,
  ASTIntersectionProperty,
  ASTObjectProperty,
  ASTPrimitiveProperty,
  ASTProperty,
  ASTPropertyValue,
  ASTRecordProperty,
  ASTReferenceProperty,
  ASTUnionProperty,
} from "../ast";
import { defineCategories } from "./category";

// console.clear();

const inferCategory = defineCategories({
  email: ["*email*.address", "*.*email*.address", "*.*email"],
  phone: ["*.*phone"],
  name: ["*.*agent*name", "*.*by", "*email*.name"],
  url: ["*.*url"],
  timestamp: ["*.*created*", "*.*updated*"],
  uuid: ["*.*uuid"],
  workerSid: ["*.*workerSid"],
  taskSid: ["*.*taskSid"],
  conversationSid: ["*.*conversationSid"],
  sid: ["*.*sid", "*.*id"],
  color: ["*.*color*"],
  emoji: ["*.*emoji"],
  notes: ["*.*notes"],
  friendlyId: ["*.*friendlyId"],
});

export function getFakerGenerator(
  type: ASTPropertyValue["value"],
  path: string
) {
  const category = inferCategory(path);
  const categoryOrType = category ?? type;

  switch (categoryOrType) {
    case "any":
    case "unknown":
    case "string":
      return "faker.word.words()";

    case "number":
      return "faker.number.int(10000)";

    case "boolean":
      return "faker.datatype.boolean()";

    case "null":
      return "null";

    case "email":
      return "faker.internet.email()";

    case "phone":
      return "faker.phone.number({ style: 'international' })";

    case "url":
      return "faker.image.url()";

    case "uuid":
      return "faker.string.uuid()";

    case "timestamp":
      return "new Date(faker.date.recent()).getTime()";

    case "sid":
      return "faker.string.alpha(34)";

    case "workerSid":
      return "'WK' + faker.string.alpha(32)";

    case "taskSid":
      return "'WT' + faker.string.alpha(32)";

    case "conversationSid":
      return "'CH' + faker.string.alpha(32)";

    case "color":
      return "faker.color.rgb()";

    case "emoji":
      return "faker.internet.emoji()";

    case "notes":
      return "faker.word.words(10)";

    case "name":
      return "faker.person.fullName()";

    case "friendlyId":
      return "faker.number.int(100)";

    default:
      return "faker.word.words()";
  }
}

function generatePrimitive(prop: ASTPrimitiveProperty, path: string) {
  return getFakerGenerator(prop.value, path);
}

function generateConstantValue(
  prop: ASTConstantProperty,
  path: string,
  includeTypes: boolean
) {
  const value =
    typeof prop.value === "string" ? `"${prop.value}"` : prop.value.toString();

  if (includeTypes) {
    const [entity, ...propPath] = path.split(".");
    if (entity && propPath.length) {
      const accessKeys = propPath.map((key) => `["${key}"]`).join("");
      return `${value} as ${entity}${accessKeys}`;
    }
  }

  return value;
}

function generateArrayValue(
  prop: ASTArrayProperty,
  path: string,
  includeTypes: boolean
) {
  const [type] = prop.value;
  const value = generateValue(type, path, includeTypes);

  return `faker.helpers.multiple(() => ${
    type.type === "object" ? `(${value})` : value
  })`;
}

function generateRecordValue(prop: ASTRecordProperty, path: string) {
  const [keyType, valueType] = prop.value;
  // const key = generateValue(keyType, path);
  // const value = generateValue(valueType, path);

  return `{ /* TODO Record<${keyType.value}, ${valueType.value}> */ }`;
}

function generateReferenceValue(prop: ASTReferenceProperty) {
  return `Mock${prop.value}()`;
}

function generateUnionValue(
  prop: ASTUnionProperty,
  path: string,
  includeTypes: boolean
) {
  const values = prop.value
    .map((val) => generateValue(val, path, includeTypes))
    .join(", ");
  return `faker.helpers.arrayElement([${values}])`;
}

function generateIntersectionValue(
  prop: ASTIntersectionProperty,
  path: string,
  includeTypes: boolean
) {
  const properties = prop.value
    .map((item) => {
      const value = generateValue(item, path, includeTypes);

      if (item.type === "reference") {
        // spread the reference types
        return `...${value}`;
      }

      if (item.type === "object" || item.type === "record") {
        // remove the curly braces
        if (value.at(0) === "{" && value.at(-1) === "}") {
          return value.substring(1, value.length - 1);
        }
      }

      return value;
    })
    .join(", ");

  return `{ ${properties} }`;
}

function generateObjectValue(
  prop: ASTObjectProperty,
  path: string,
  includeTypes: boolean
) {
  const properties = prop.value
    .map((item) => generateProperty(item, item.name, path, includeTypes))
    .join(", ");

  return `{ ${properties} }`;
}

function generateFunctionValue(prop: ASTFunctionProperty) {
  return `() => { /* TODO function */ }`;
}

function generateValue(
  prop: ASTPropertyValue,
  path: string,
  includeTypes: boolean
): string {
  switch (prop.type) {
    case "primitive":
      return generatePrimitive(prop, path);

    case "constant":
      return generateConstantValue(prop, path, includeTypes);

    case "reference":
      return generateReferenceValue(prop);

    case "union":
      return generateUnionValue(prop, path, includeTypes);

    case "intersection":
      return generateIntersectionValue(prop, path, includeTypes);

    case "record":
      return generateRecordValue(prop, path);

    case "array":
      return generateArrayValue(prop, path, includeTypes);

    case "object":
      return generateObjectValue(prop, path, includeTypes);

    case "function":
      return generateFunctionValue(prop);

    default:
      return `"/* TODO ${prop.type} */"`;
  }
}

function generateProperty(
  prop: ASTProperty,
  name: string,
  path: string,
  includeTypes: boolean
) {
  return `"${name}": ${generateValue(prop, `${path}.${name}`, includeTypes)}`;
}

export function generate(
  data: Array<ASTEntity>,
  includeTypes: boolean = false,
  useExport: boolean = false
) {
  const body = data.map((item) => {
    const overridesType = includeTypes ? `: Partial<${item.name}>` : "";
    const resultType = includeTypes ? `: ${item.name}` : "";
    const exportKeyword = useExport ? `export ` : "";
    const anyType = includeTypes ? `: any` : "";

    const output = [];
    if (item.isExported) {
      switch (item.type) {
        case "alias":
          {
            const values = item.entities
              .map((entity) => `Mock${entity}()`)
              .join(", ");

            output.push(
              `${exportKeyword}function Mock${item.name}(overrides${overridesType} = {})${resultType} {`
            );
            output.push(`  const result = faker.helpers.arrayElement([`);
            output.push(`    faker.helpers.arrayElement([${values}])`);
            output.push(`  ]);`);
            output.push(`  return { ...result, ...overrides }`);
            output.push(`}`);

            output.push("");
          }
          return output.join("\n");

        case "union":
          {
            const values = item.values
              .map((value) => {
                return generateConstantValue(
                  value as ASTConstantProperty,
                  item.name,
                  includeTypes
                );
              })
              .join(", ");

            output.push(
              `${exportKeyword}function Mock${item.name}(overrides${overridesType})${resultType} {`
            );
            // output.push(`  const result = faker.helpers.arrayElement([`);
            // output.push(`   ${values}`);
            // output.push(`  ]);`);
            // output.push(`  return overrides ?? result`);

            output.push(
              `  return overrides ?? faker.helpers.arrayElement([${values}]);`
            );

            output.push(`}`);

            output.push("");
          }
          return output.join("\n");

        case "instance":
          {
            const inherits = item.inherits?.map(
              (entity) => `...Mock${entity}()`
            );

            const properties = item.properties.map((prop) =>
              generateProperty(prop, prop.name, item.name, includeTypes)
            );

            output.push(
              `${exportKeyword}function Mock${item.name}(overrides${overridesType} = {})${resultType} {`
            );
            output.push(`  const result = {`);
            if (inherits?.length) {
              output.push(`    ${inherits.join(",\n    ")},`);
            }
            output.push(`    ${properties.join(",\n    ")}`);
            output.push(`  };`);
            output.push(`  return { ...result, ...overrides }`);
            output.push(`}`);

            output.push("");
          }
          return output.join("\n");

        case "placeholder":
          {
            // 1
            // output.push(
            //   `${exportKeyword}function Mock${item.name}(overrides?${overridesType})${resultType} {`
            // );

            // 2
            // output.push(
            //   `${exportKeyword}function Mock${item.name}(overrides${
            //     includeTypes ? `?${resultType}` : ""
            //   })${resultType} {`
            // );

            output.push(
              `${exportKeyword}function Mock${item.name}(overrides${anyType})${resultType} {`
            );

            output.push(`  return {`);
            output.push(
              `    /* TODO this is a placeholder because the original type or interface couldn't be parsed. */`
            );
            output.push(`    ...overrides`);
            output.push(`  };`);
            output.push(`}`);

            output.push("");
          }
          return output.join("\n");

        case "constant":
          {
            const value = generateConstantValue(
              item.value as ASTConstantProperty,
              item.name,
              includeTypes
            );

            output.push(
              `${exportKeyword}function Mock${item.name}()${resultType} {`
            );
            output.push(`  return ${value};`);
            output.push(`}`);

            output.push("");
          }
          return output.join("\n");

        case "primitive":
          {
            const value = generatePrimitive(
              item.value as ASTPrimitiveProperty,
              ""
            );

            output.push(
              `${exportKeyword}function Mock${item.name}()${resultType} {`
            );
            output.push(`  return ${value}`);
            output.push(`}`);

            output.push("");
          }
          return output.join("\n");

        case "array":
          {
            const value = generateArrayValue(item.value, "", includeTypes);

            output.push(
              `${exportKeyword}function Mock${item.name}(overrides${
                resultType ? `?${resultType}` : ""
              })${resultType} {`
            );
            output.push(`  const result = ${value}`);
            output.push(`  return overrides ?? result;`);
            output.push(`}`);

            output.push("");
          }
          return output.join("\n");
      }
    }
  });

  return body.join("\n");
}
