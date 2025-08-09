"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
// import { useRouter } from "next/router";
import { Suspense, useEffect } from "react";
import { toast, Toaster } from "sonner";

function Auth() {
  const params = new useSearchParams();
  const code = params.get("code");
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const COGNITO_API_URL = process.env.NEXT_PUBLIC_COGNITO_API_URL;
  const COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const COGNITO_REDIRECT_URI = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI;

  useEffect(() => {
    const getAccess = code && getAccessToken();
    if (getAccess) {
      setTimeout(() => {
        location.href = `${BASE_URL}/dashboard/questions`;
      }, 2000);
    }
  }, [code]);

  async function getAccessToken() {
    try {
      const payload = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: COGNITO_CLIENT_ID,
        code,
        redirect_uri: COGNITO_REDIRECT_URI,
      });

      const res = await axios.post(
        `${COGNITO_API_URL}/oauth2/token`,
        payload.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (res.status !== 200) {
        toast("Gagal mengambil data dari server");
        return;
      }

      sessionStorage.setItem("access_token", res.data.access_token);
      document.cookie = `refresh_token=${res.data.refresh_token}; path=/; max-age=432000; secure; samesite=strict`;

      return true;
    } catch (err) {
      toast(err.message);
      console.log(err);
    }
  }
  return (
    <>
      <Toaster position="top-right" />
      <h1>Tunggu! Kamu akan di redirect ke halaman lain...</h1>
    </>
  );
}

export default function Page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Auth />
      </Suspense>
    </>
  );
}
