import Head from "next/head";

export function Home() {
  return (
    <section>
      <Head>
        <title>Wars World Home Page</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="@rounded-lg @bg-black/70 @center @max-w-[75vw] @p-3 inProgress">
        <h2>Work in progress...</h2>
        <h1>Welcome to Wars World!</h1>
        <p>First of all, congrats on setting your developer environment!</p>
        <p>
          We are in the process of establishing a new foundation for developers
          to help with the T3 stack (typescript, tRPC, tailwind, prisma,
          nextAuth). Please make sure to contact femboy#6116 to join our
          development discord.
        </p>
        <p>
          Before you decide to take on one of our{" "}
          <a href={"https://github.com/WarsWorld/WarsWorld/issues"}>
            {" "}
            issues (most need to be triaged)
          </a>
          . Make sure you&apos;ve talked with us or gotten confirmation that no
          one else is working on that task. Otherwise, you risk working on
          something that&apos;s already being done.{" "}
        </p>
        <h3>
          Please have patience while we continue to do establish the basic
          foundation.
        </h3>
      </div>
    </section>
  );
}
