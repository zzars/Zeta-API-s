const { FieldValue } = require("firebase-admin/firestore");
const { db } = require("./firebase");

// Collection: 'stats', Document: 'main'
const statsRef = db.doc("stats/main");

async function logRequest(endpoint) {
  const today = new Date().toISOString().slice(0, 10);

  const todayFieldPath = `today.${today}`;

  try {
    await statsRef.update({
      totalRequest: FieldValue.increment(1),

      [todayFieldPath]: FieldValue.increment(1),
    });
  } catch (error) {
    if (
      error.code === "NOT_FOUND" ||
      error.message.includes("No document to update")
    ) {
      console.log("Dokumen 'stats/main' belum ada, membuat baru...");

      await setTotalEndpoints(0);

      try {
        await statsRef.update({
          totalRequest: FieldValue.increment(1),
          [todayFieldPath]: FieldValue.increment(1),
        });
      } catch (e2) {
        console.error("Gagal log request setelah inisialisasi:", e2);
      }
    } else {
      console.error("Error logging request:", error);
    }
  }
}

async function setTotalEndpoints(n) {
  try {
    await statsRef.set(
      {
        totalEndpoints: n,
      },
      { merge: true },
    );
  } catch (e) {
    console.error("Error setting total endpoints di Firestore:", e);
  }
}

async function getStats() {
  const today = new Date().toISOString().slice(0, 10);

  try {
    const docSnap = await statsRef.get();

    if (!docSnap.exists) {
      console.warn("Dokumen stats 'stats/main' belum ada.");
      return { totalRequest: 0, requestToday: 0, totalEndpoints: 0 };
    }

    const stats = docSnap.data();
    console.log(stats);

    const requestToday =
      stats.today && stats.today[today] ? stats.today[today] : 0;

    return {
      totalRequest: stats.totalRequest || 0,
      requestToday: requestToday,
      totalEndpoints: stats.totalEndpoints || 0,
    };
  } catch (e) {
    console.error("Error mengambil stats dari Firestore:", e);
    return { totalRequest: 0, requestToday: 0, totalEndpoints: 0 };
  }
}

module.exports = { logRequest, setTotalEndpoints, getStats };
