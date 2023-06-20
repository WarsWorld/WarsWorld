"use client";
import { DefaultSession } from "next-auth";

// Default Session TYPE
// This is a usercard feature I was implementing
// It helps relay info on signed in user
export function UserInfo({ user }: { user: DefaultSession["user"] }) {
  return (
    <div className="card">
      <div className="card-body">
        <p>Current Logged In User: {user?.name}</p>
        <p className="card-text">{user?.email}</p>
      </div>
    </div>
  );
}
