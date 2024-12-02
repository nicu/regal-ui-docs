import { useCallback, useEffect, useRef, useState } from "react";
// import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useColorMode } from "@docusaurus/theme-common";
import Layout from "@theme/Layout";
import Editor from "@monaco-editor/react";
import styles from "./styles.module.css";
import { parseContents } from "./lib/parser/parser";
import Split from "react-split";
import initialContent from "./feed";
// import initialData from "./code.json";
import initialData from "./feed.json";
import { ASTEntity } from "./lib/ast";
import { matchEntities } from "./lib/matcher/matcher";
import Button from "@site/src/components/Button/Button";

const MATCH_THRESHOLD = 0.6;

let matches: Array<any> = [];

function EditorGroup() {
  const { colorMode } = useColorMode();

  const [ast, setAst] = useState<Array<ASTEntity>>(() =>
    parseContents(initialContent)
  );
  const [data, setData] = useState<Array<any>>(() => initialData);
  const [output, setOutput] = useState<string>();

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      try {
        setAst(parseContents(value));
      } catch {}
    }
  };

  const handleSecondEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      try {
        setData(JSON.parse(value));
      } catch {}
    }
  };

  const handleOutputEditorDidMount = useCallback(
    (editor, monaco) => {
      const hoverProvider = monaco.languages.registerHoverProvider("markdown", {
        provideHover: (model, position) => {
          const word = model.getWordAtPosition(position);
          if (word) {
            const lineContent: string = model.getLineContent(
              position.lineNumber
            );
            const regexMatch = lineContent.match(/\[(\d+)\]$/);
            const index = regexMatch?.[1];

            if (index && matches[index]) {
              const differences = matches[index].differences;
              const diffText = differences[word.word]
                ?.map(({ path, note }) =>
                  path ? `- **${path}**: ${note}` : `- ${note}`
                )
                .join("\n\n");

              return {
                range: new monaco.Range(
                  position.lineNumber,
                  word.startColumn,
                  position.lineNumber,
                  word.endColumn
                ),
                contents: [
                  { value: `**${word.word}**` },
                  {
                    value: diffText,
                    supportHtml: true,
                    isTrusted: true,
                  },
                ],
              };
            }
          }
        },
      });

      editor.onDidDispose(() => {
        hoverProvider.dispose();
      });
    },
    [matches]
  );

  const doMatch = () => {
    matches = matchEntities(data, ast, MATCH_THRESHOLD);
  };

  useEffect(() => doMatch(), [ast, data]);
  useEffect(() => {
    setOutput(
      matches
        ?.map((match, index) => {
          return [
            "```json",
            JSON.stringify(match.data, null, 2),
            "```",
            match.entities
              ?.map((item) => `${item.name} (${item.score})`)
              .join(", ") + ` [${index}]`,
            "",
            "",
          ].join("\n");
        })
        .join("\n\n")
    );
  }, [matches]);

  const [isMatchResultsVisible, setIsMatchResultsVisible] = useState(false);
  const toggleJSONEditor = useCallback(() => {
    setIsMatchResultsVisible((prev) => !prev);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.actionToolbar}>
        <Button onClick={toggleJSONEditor}>
          {isMatchResultsVisible ? "Hide" : "Show"} Matches
        </Button>
      </div>
      <Split className={styles.container} gutterSize={8}>
        <div className={styles.editor}>
          <Editor
            onValidate={(markers) => console.log(markers)}
            height="100%"
            defaultLanguage="typescript"
            defaultValue={initialContent}
            theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
            onChange={handleEditorChange}
            options={{
              scrollBeyondLastLine: false,
              minimap: { enabled: false },
            }}
            defaultPath="types.ts"
          />
        </div>

        {isMatchResultsVisible ? (
          <div className={styles.editor}>
            <Editor
              key="readonly"
              height="100%"
              defaultLanguage="markdown"
              defaultValue=""
              value={output}
              theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
              options={{
                scrollBeyondLastLine: false,
                lineNumbers: "off",
                readOnly: true,
                minimap: { enabled: false },
                wordWrap: "on",
              }}
              onMount={handleOutputEditorDidMount}
            />
          </div>
        ) : (
          <div className={styles.editor}>
            <Editor
              key="editable"
              height="100%"
              defaultLanguage="json"
              value={JSON.stringify(data, null, 2)}
              theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
              onChange={handleSecondEditorChange}
              options={{
                scrollBeyondLastLine: false,
                minimap: { enabled: false },
              }}
              defaultPath="mocks.ts"
            />
          </div>
        )}
      </Split>
    </div>
  );
}

export default function Home(): JSX.Element {
  // const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title="Mock Generator"
      description="Tools for generating mocks"
      noFooter
    >
      <EditorGroup />
    </Layout>
  );
}
