import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { redirect } from "next/navigation";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export async function auth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  return {
    getToken: async () => token || null,
    userId: token ? (jwtDecode(token) as any).userId : null,
    protect: () => {
      if (!token) {
        redirect("/login");
      }
    }
  };
}

export async function currentUser() {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) return null;

  try {
    const decoded = jwtDecode(token) as any;
    return {
      id: decoded.userId,
      email: decoded.email,
      firstName: decoded.firstName || "",
      lastName: decoded.lastName || "",
      role: decoded.role || "user"
    } as User;
  } catch (error) {
    return null;
  }
}
