import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function LoggedHome(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data } = useSession();
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    return res.send({
      content:
        "Signed In! If you see this authentication was a success and you session is live",
    });
  }

  res.send({
    error: "You must be signed in to view the protected content on this page.",
  });
  return (
    <>
      <h1>This will be what the user sees after sucessful login</h1>
      <p>
        We will likely port most of BasicHome.tsx here and then modify as for
        the personalized/logged in functions. The session token for the logged
        in user will persist throughout all pages until logout so you can call
        the useSession along with any user details(username, email, preferences)
      </p>
      <pre>Example: {JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
