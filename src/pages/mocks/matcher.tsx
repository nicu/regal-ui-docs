import BrowserOnly from "@docusaurus/BrowserOnly";

export default function Index() {
  return (
    <BrowserOnly fallback={<h1>Mock Matcher Page</h1>}>
      {() => {
        const Page = require("./_matcher_client").default;
        return <Page />;
      }}
    </BrowserOnly>
  );
}
