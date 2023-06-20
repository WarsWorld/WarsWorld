import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

export default function RegistrationPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    // This script was a work in progress registration page
    // I will rewrite this but I had to stop dev on it to do Oauth
    const result = (await signIn("credentials", {
      redirect: false,
      username,
      password,
    })) as { error: string | undefined };

    if (!result.error) {
      // user is successfully registered and authenticated
      router.push("/"); // Redirect to WIP loggedin homepage
    } else {
      // registration failed
      console.error(result.error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Registration Page</h1>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={handleUsernameChange} />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button type="submit" disabled={loading}>
          Register
        </button>
      </form>
    </div>
  );
}
