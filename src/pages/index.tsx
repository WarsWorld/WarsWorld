import Head from "next/head";
import { BasicHome } from "./home/BasicHome";

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>Home Page | Wars World</title>
      </Head>
      {
        //TODO: Make it so there is a different home page
        // when the user is logged in
        //We'd have a basic home page and a specialized/logged in home page
      }
      <BasicHome />
    </>
  );
}
