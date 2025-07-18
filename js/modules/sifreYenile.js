let authInstance, sendPasswordResetEmailFn;

export async function initFirebasePasswordReset() {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
  const { getAuth, sendPasswordResetEmail } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");

  const firebaseConfig = {
    apiKey: "AIzaSyCvVIjDT1BGaGlh7Xbrll__9I5KfsLO3Ls",
    authDomain: "user-api-20602.firebaseapp.com",
    projectId: "user-api-20602",
    storageBucket: "user-api-20602.appspot.com",
    messagingSenderId: "1097297025895",
    appId: "1:1097297025895:web:319ed55e8058ce1e43adc2"
  };

  const app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  sendPasswordResetEmailFn = sendPasswordResetEmail;
}

export async function resetPassword(email) {
  if (!authInstance) await initFirebasePasswordReset();

  try {
    await sendPasswordResetEmailFn(authInstance, email);
    return "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.";
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    throw new Error("Şifre sıfırlama başarısız: " + (error.message || ""));
  }
}
