// Firebase bağlantı değişkenleri
let auth, db;
let createUserWithEmailAndPasswordFn, signInWithEmailAndPasswordFn, signOutFn, 
    onAuthStateChangedFn, sendEmailVerificationFn, applyActionCodeFn;
let docFn, setDocFn, getDocFn, serverTimestampFn;

// Firebase başlatıcı
async function initFirebase() {
  try {
    // Firebase modüllerini dinamik olarak yükle
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const { 
      getAuth,
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      signOut,
      onAuthStateChanged,
      sendEmailVerification,
      applyActionCode
    } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
    
    const { getFirestore, doc, setDoc, getDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

    // Firebase konfigürasyonu
    const firebaseConfig = {
      apiKey: "AIzaSyCvVIjDT1BGaGlh7Xbrll__9I5KfsLO3Ls",
      authDomain: "user-api-20602.firebaseapp.com",
      projectId: "user-api-20602",
      storageBucket: "user-api-20602.appspot.com",
      messagingSenderId: "1097297025895",
      appId: "1:1097297025895:web:319ed55e8058ce1e43adc2"
    };

    // Firebase uygulamasını başlat
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Global fonksiyon atamaları
    createUserWithEmailAndPasswordFn = createUserWithEmailAndPassword;
    signInWithEmailAndPasswordFn = signInWithEmailAndPassword;
    signOutFn = signOut;
    onAuthStateChangedFn = onAuthStateChanged;
    sendEmailVerificationFn = sendEmailVerification;
    applyActionCodeFn = applyActionCode;
    docFn = doc;
    setDocFn = setDoc;
    getDocFn = getDoc;
    serverTimestampFn = serverTimestamp;

    // E-posta doğrulama kontrolü
    await checkEmailVerification();

    // Auth state listener'ı başlat
    initAuthStateListener();
    
    return { auth, db };

  } catch (error) {
    console.error("Firebase başlatma hatası:", error);
    throw error;
  }
}

// E-posta doğrulama kontrolü
async function checkEmailVerification() {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const oobCode = urlParams.get('oobCode');
  
  if (mode === 'verifyEmail' && oobCode) {
    try {
      await applyActionCodeFn(auth, oobCode);
      
      if (auth.currentUser) {
        await auth.currentUser.reload();
      }
      
      window.showAlert?.("E-posta doğrulama başarılı!", "success");
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("Doğrulama hatası:", error);
      window.showAlert?.(`Doğrulama başarısız: ${error.message}`, "error");
    }
  }
}

// Geliştirilmiş hata yönetimi
function handleAuthError(error) {
  console.error("Auth hatası detay:", {
    code: error.code,
    message: error.message,
    stack: error.stack
  });

  const errorMap = {
    'auth/permission-denied': "İşlem yetkiniz yok. Lütfen oturum açın.",
    'auth/network-request-failed': "Ağ hatası oluştu. İnternet bağlantınızı kontrol edin.",
    'auth/too-many-requests': "Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.",
    'auth/email-already-in-use': "Bu e-posta zaten kullanımda",
    'auth/user-not-found': "Kullanıcı bulunamadı",
    'auth/wrong-password': "Geçersiz şifre",
    'auth/invalid-email': "Geçersiz e-posta formatı",
    'auth/weak-password': "Şifre en az 6 karakter olmalı"
  };

  return new Error(errorMap[error.code] || `İşlem başarısız: ${error.message || "Bilinmeyen hata"}`);
}

// Kullanıcı durum dinleyici
function initAuthStateListener() {
  if (!auth) return;

  onAuthStateChangedFn(auth, async (user) => {
    if (user) {
      try {
        // Kullanıcı durumunu güncelle
        await user.reload();
        
        // LocalStorage'e kaydet
        localStorage.setItem("userUID", user.uid);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("emailVerify", user.emailVerified);
      } catch (error) {
        console.error("Kullanıcı durumu güncelleme hatası:", error);
      }
    } else {
      // Oturum kapalı
      localStorage.removeItem("userUID");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("emailVerify");
    }
  });
}

// KAYIT OL
export async function register(email, password) {
  try {
    if (!auth) await initFirebase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Geçersiz e-posta formatı");
    }
    if (password.length < 6) {
      throw new Error("Şifre en az 6 karakter olmalı");
    }

    const userCredential = await createUserWithEmailAndPasswordFn(auth, email, password);
    const user = userCredential.user;

    await setDocFn(docFn(db, "users", user.uid), {
      email,
      createdAt: serverTimestampFn(),
      lastLogin: serverTimestampFn()
    });

    await sendEmailVerificationFn(user, {
      url: window.location.origin + '/modul/',
      handleCodeInApp: true
    });

    console.log("Kayıt başarılı. E-posta onayı gönderildi.");
    return user.uid;
  } catch (error) {
    throw handleAuthError(error);
  }
}

// GİRİŞ YAP
export async function login(email, password) {
  try {
    if (!auth) await initFirebase();

    // Önceki oturumu temizle
    await signOutFn(auth);
    const authKeys = ['userUID', 'userEmail', 'emailVerify','firebase:authUser'];
    authKeys.forEach(key => localStorage.removeItem(key));

    const userCredential = await signInWithEmailAndPasswordFn(auth, email, password);
    const user = userCredential.user;
    
    // Kullanıcı durumunu güncelle
    await user.reload();
    await user.getIdToken(true);
    
    // Firestore'a son giriş zamanını kaydet
    try {
      await setDocFn(docFn(db, "users", user.uid), { 
        lastLogin: serverTimestampFn() 
      }, { merge: true });
    } catch (dbError) {
      console.error("Firestore kayıt hatası:", dbError);
    }

    return user.uid;
  } catch (error) {
    throw handleAuthError(error);
  }
}

// ÇIKIŞ YAP
export async function logout() {
  try {
    if (!auth) await initFirebase();
    
    // Firestore'a çıkış zamanını kaydet (isteğe bağlı)
    const user = auth.currentUser;
    if (user) {
      try {
        await setDocFn(docFn(db, "users", user.uid), { 
          lastLogout: serverTimestampFn() 
        }, { merge: true });
      } catch (dbError) {
        console.error("Firestore çıkış kaydı hatası:", dbError);
      }
    }
    
    await signOutFn(auth);
    
    // SADECE auth ile ilgili verileri temizle
    const authKeys = ['userUID', 'userEmail', 'emailVerify','firebase:authUser'];
    authKeys.forEach(key => localStorage.removeItem(key));
    
    console.log("Çıkış yapıldı");
  } catch (error) {
    console.error("Çıkış hatası:", error);
    throw new Error("Çıkış işlemi başarısız");
  }
}

// KULLANICI BİLGİLERİ
export async function getCurrentUser() {
  if (!auth) await initFirebase();

  // Kullanıcı hazırsa direkt döndür
  if (auth.currentUser) {
    await auth.currentUser.reload();
    return {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      emailVerified: auth.currentUser.emailVerified
    };
  }

  // Aksi halde onAuthStateChanged ile bekle
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChangedFn(auth, async (user) => {
      unsubscribe(); // dinleyiciyi kaldır
      if (user) {
        await user.reload();
        resolve({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        });
      } else {
        resolve(null);
      }
    });
  });
}

export async function isLoggedIn() {
  try {
    if (!auth) await initFirebase();
    
    const user = await new Promise((resolve) => {
      const unsubscribe = onAuthStateChangedFn(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
    
    return !!user && localStorage.getItem("userUID") === user.uid;
  } catch (error) {
    console.error("Giriş kontrol hatası:", error);
    return false;
  }
}

export async function isVerified() {
  try {
    if (!auth) await initFirebase();
    
    const user = await new Promise((resolve) => {
      const unsubscribe = onAuthStateChangedFn(auth, async (user) => {
        unsubscribe();
        
        // Kullanıcı varsa ve email doğrulanmamışsa, güncel durumu kontrol et
        if (user && !user.emailVerified) {
          await user.reload();
          resolve(auth.currentUser);
        } else {
          resolve(user);
        }
      });
    });
    
    return user?.emailVerified || false;
  } catch (error) {
    console.error("Doğrulama kontrol hatası:", error);
    return false;
  }
}

// TEKRAR EPOSTA ONAYI
export async function resendVerificationEmail() {
  if (!auth) await initFirebase();
  const user = auth.currentUser;
  
  if (user && !user.emailVerified) {
    try {
      await sendEmailVerificationFn(user, {
        url: window.location.origin + '/modul/', // Doğrulama sonrası yönlendirme
        handleCodeInApp: true
      });
      return "Doğrulama e-postası gönderildi";
    } catch (error) {
      throw new Error("E-posta gönderilemedi: " + error.message);
    }
  } else {
    throw new Error("Kullanıcı oturumu açık değil veya zaten doğrulanmış.");
  }
}

// SIFRE SIFIRLAMA
export async function resetPassword(email) {
  try {
    if (!auth) await initFirebase();
    
    const { sendPasswordResetEmail } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
    
    await sendPasswordResetEmail(auth, email, {
      url: window.location.origin + '/modul/login.html',
      handleCodeInApp: true
    });
    
    return "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi";
  } catch (error) {
    throw handleAuthError(error);
  }
}