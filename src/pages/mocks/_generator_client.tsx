import BrowserOnly from "@docusaurus/BrowserOnly";
import { useState } from "react";
// import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useColorMode } from "@docusaurus/theme-common";
import Layout from "@theme/Layout";
import Editor from "@monaco-editor/react";
import styles from "./styles.module.css";
import { parseContents } from "../../lib/parser/parser";
import { generate } from "../../lib/generator/generator";
import Split from "react-split";
import { faker } from "@faker-js/faker";
// import initialContent from "./feed";
import initialContent from "./__mocks__/code";
// const initialContent = `
// `;

function generateImports(
  entities: Array<{ name: string; isExported: boolean }>
) {
  const importedTypes = entities
    .filter((entity) => entity.isExported)
    .map((entity) => entity.name)
    .join(", ");

  if (!importedTypes.length) {
    return "";
  }

  return [
    "// #region Imports",
    `import type { ${importedTypes} } from "types";`,
    "var faker: any;",
    "// #endregion",
  ].join("\n");
}

function generateBody(code: string) {
  const ast = parseContents(code);
  return [generateImports(ast), generate(ast, true, true)].join("\n\n");
}

let code: string = initialContent;

function EditorGroup() {
  const { colorMode } = useColorMode();

  const [generatedCode, setGeneratedCode] = useState(() => {
    try {
      return generateBody(code);
    } catch {
      return "";
    }
  });
  const [generatedJson, setGeneratedJson] = useState<string>();

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      code = value;

      try {
        setGeneratedCode(generateBody(value));
      } catch {}
    }
  };

  const handleSecondEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setGeneratedCode(value);
    }
  };

  const evalCode = (mockName: string) => {
    try {
      const jsCode = generate(parseContents(code), false, false);
      const fn = eval(`(faker) => {${jsCode}; return ${mockName}(); }`);
      setGeneratedJson(JSON.stringify(fn(faker), null, 2));
    } catch (e) {
      console.error(e);
    }
  };

  function handleMocksEditorDidMount(editor, monaco) {
    // Explanation:
    // Press F1 => the action will appear and run if it is enabled
    // Press Ctrl-F10 => the action will run if it is enabled
    // Press Chord Ctrl-K, Ctrl-M => the action will run if it is enabled

    editor.addAction({
      // An unique identifier of the contributed action.
      id: "mock-generator",

      // A label of the action that will be presented to the user.
      label: "Generate Mock",

      // An optional array of keybindings for the action.
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.F10,
        // chord
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM
        ),
      ],

      // A precondition for this action.
      precondition: null,

      // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
      keybindingContext: null,

      contextMenuGroupId: "navigation",

      contextMenuOrder: 1,

      // Method that will be executed when the action is triggered.
      // @param editor The editor instance is passed in as a convenience
      run: function (ed) {
        const position = ed.getPosition();
        const word = ed.getModel()?.getWordAtPosition(position);
        if (word) {
          evalCode(word?.word);
        }
      },
    });
  }

  return (
    <div className={styles.page}>
      {/* <div className={styles.actionToolbar}>
        <Button onClick={evalCode}>Run</Button>
      </div> */}
      <Split
        className={styles.container}
        gutterSize={8} /*sizes={[25, 50, 25]}*/
      >
        <div className={styles.editor}>
          <Editor
            height="100%"
            defaultLanguage="typescript"
            defaultValue={code}
            theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
            onChange={handleEditorChange}
            options={{
              scrollBeyondLastLine: false,
              minimap: { enabled: false },
            }}
            defaultPath="types.ts"
          />
        </div>
        <div className={styles.editor}>
          <Editor
            height="100%"
            defaultLanguage="typescript"
            defaultValue={generatedCode}
            value={generatedCode}
            theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
            onChange={handleSecondEditorChange}
            options={{
              scrollBeyondLastLine: false,
              minimap: { enabled: false },
            }}
            defaultPath="mocks.ts"
            onMount={handleMocksEditorDidMount}
          />
        </div>

        <div className={styles.editor}>
          <Editor
            height="100%"
            defaultLanguage="json"
            defaultValue=""
            value={generatedJson}
            theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
            options={{
              scrollBeyondLastLine: false,
              lineNumbers: "off",
            }}
          />
        </div>
      </Split>
    </div>
  );
}

export default function GeneratorPage(): JSX.Element {
  // const { siteConfig } = useDocusaurusContext();

  return (
    <BrowserOnly fallback={<div>Mock Generator Page</div>}>
      {() => (
        <Layout
          title="Mock Generator Page"
          description="Tools for generating mocks"
          noFooter
        >
          <EditorGroup />
        </Layout>
      )}
    </BrowserOnly>
  );
}
