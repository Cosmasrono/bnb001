// Emails that always have host access, regardless of the isHost flag.
export const HOST_EMAILS = ["ccosmas001@gmail.com"];

export function isHostUser(user: { email: string; isHost: boolean }) {
  return user.isHost || HOST_EMAILS.includes(user.email.toLowerCase());
}
