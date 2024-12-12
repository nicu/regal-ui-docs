import BrowserOnly from "@docusaurus/BrowserOnly";

export default function Index() {
  return (
    <BrowserOnly fallback={<h1>Mock Generator Page</h1>}>
      {() => {
        const Page = require("./_generator_client").default;
        return <Page />;
      }}
    </BrowserOnly>
  );
}
